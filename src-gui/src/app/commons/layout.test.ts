import {describe, expect, it} from "vitest";

import type {MonitorInfo, MonitorPlacement} from "../api/Interface";
import {snapRect, validatePlacements} from "./layout";

const server: MonitorInfo[] = [{
    monitor_id: 0,
    min_x: 0,
    min_y: 0,
    max_x: 1920,
    max_y: 1080,
}];

const placement = (
    client_uid: string,
    workspace_x: number,
): MonitorPlacement => ({
    client_uid,
    client_monitor_id: 0,
    workspace_x,
    workspace_y: 0,
    width: 1280,
    height: 1080,
});

describe("workspace graph validation", () => {
    it("accepts a client-only chain connected transitively to the server", () => {
        const result = validatePlacements(server, [
            placement("a", 1920),
            placement("b", 3200),
        ]);
        expect(result.ok).toBe(true);
        expect(result.notConnectedToServerIndices.size).toBe(0);
    });

    it("rejects a detached client component", () => {
        const result = validatePlacements(server, [
            placement("a", 1920),
            placement("b", 7000),
            placement("c", 8280),
        ]);
        expect(result.ok).toBe(false);
        expect([...result.notConnectedToServerIndices]).toEqual([1, 2]);
        expect(result.errors.join(" ")).toContain(
            "not connected to the server topology",
        );
    });
});

describe("client placement snapping", () => {
    it("snaps a candidate edge to another client placement", () => {
        const snapped = snapRect(
            {x: 3194, y: 0, width: 1280, height: 1080},
            [{x: 1920, y: 0, width: 1280, height: 1080}],
            10,
        );
        expect(snapped.x).toBe(3200);
    });
});
