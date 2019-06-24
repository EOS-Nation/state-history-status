#!/usr/bin/env node

import * as commander from "commander";
import WebSocket, {Data} from "ws";
import {createInitialTypes, getTypesFromAbi, SerialBuffer, Type} from "eosjs/dist/eosjs-serialize";

const command = new commander.Command();

command
    .name("State History Status")
    .version("1.0.0")
    .description("Retrieves the nodeos state history status and outputs the result as json.")
    .option("-H, --host [host]", "Nodeos host with state history enabled", "localhost")
    .option("-P, --port [port]", "Port of the state history plugin", "8080")
    .parse(process.argv);

let shutdown = false;
let receivedAbi = false;
let wsAbi: Map<string, Type>;

const textDecoder = new TextDecoder("utf-8", {fatal: true});
const textEncoder = new TextEncoder();

const ws = new WebSocket("ws://" + command.host + ":" + command.port, {perMessageDeflate: false});
ws.binaryType = "arraybuffer";

ws.onerror = (error) => {
    console.error("Failed to open websocket.");
    console.error(error.message);
    process.exit(1);
};

ws.onclose = () => {
    if (!shutdown) {
        console.error("Websocket closed unexpectedly");
        process.exit(1);
    } else {
        process.exit(0);
    }
};

ws.onmessage = (event: { data: Data }) => {
    if (!receivedAbi) {
        receivedAbi = true;

        try {
            const json = JSON.parse(event.data.toString());
            wsAbi = getTypesFromAbi(createInitialTypes(), json);
        } catch (e) {
            console.error("Failed to parse ABI response.");
            console.error(e);
            process.exit(1);
        }

        try {
            const buffer = new SerialBuffer({textEncoder, textDecoder});
            wsAbi.get("request")!.serialize(buffer, ["get_status_request_v0", {}]);
            ws.send(buffer.array);
        } catch (e) {
            console.error("Failed to serialize status request.");
            console.error(e);
            process.exit(1);
        }

    } else {
        const uintArray = new Uint8Array(event.data as ArrayBuffer);
        const buffer = new SerialBuffer({textEncoder, textDecoder, array: uintArray});

        try {
            const result = wsAbi.get("result")!.deserialize(buffer)[1];
            console.log(JSON.stringify(result));
            shutdown = true;
            ws.close();
        } catch (e) {
            console.error("Failed to deserialize status response.");
            console.error(e);
            process.exit(1);
        }
    }
};
