#!/usr/bin/env node

import { executeHubCiCli } from "./cli.ts";

process.exitCode = await executeHubCiCli(process.argv.slice(2));
