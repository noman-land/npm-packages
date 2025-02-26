import prettier from "prettier";
import prettierConfig from "../../../.prettierrc.json";
import { VFile } from "vfile";
import { expect } from "vitest";
import path from "node:path";

import type { Options } from "prettier";

type Serializer = Parameters<typeof expect.addSnapshotSerializer>[0];

function getSourceDir(): string {
  const scriptDir = process.env["PNPM_SCRIPT_SRC_DIR"];
  if (scriptDir == null) {
    throw new Error(`PNPM_SCRIPT_SRC_DIR env variable must be set`);
  }
  return path.resolve(scriptDir, "../..");
}

/**
 * Strip absolute paths from the output to make tests portable
 */
function stripAbsolutePaths(str: string): string {
  // return str;
  return str.replaceAll(getSourceDir(), "<repo-root>");
}

const StringSerializer: Serializer = {
  serialize(val: string, config, indentation, depth, refs, printer) {
    return printer(stripAbsolutePaths(val), config, indentation, depth, refs);
  },
  test(val) {
    return (
      typeof val === "string" &&
      // If we don't test for the string we're stripping we'll hit infinite
      // recursion. I'm not sure why: the `printer` function must include this
      // serializer, which is obviously wrong?
      val.includes(getSourceDir())
    );
  },
};

expect.addSnapshotSerializer(StringSerializer);

const VFileSerializer: Serializer = {
  serialize(val: VFile, _config, _indentation, _depth, _refs, _printer) {
    const contents = val.toString();
    const formatted = prettier.format(contents, {
      parser: "babel",
      ...(prettierConfig as Options),
    });
    return stripAbsolutePaths(formatted);
  },
  test(val) {
    return val instanceof VFile;
  },
};

expect.addSnapshotSerializer(VFileSerializer);
