import { Table } from "console-table-printer";

import { Row } from "./types";

export class Prettify {
  public table: Row[];

  constructor(data: Row[]) {
    this.table = data;
  }

  public get(): Row[] {
    return this.table;
  }

  public tabulate() {
    if (!this.table.length) {
      console.error("Table has empty fields");
    } else {
      const p = new Table({
        columns: [
          { name: "contract", alignment: "center" },
          { name: "state_variable", alignment: "center" },
          { name: "storage_slot", alignment: "center" },
          { name: "numberOfBytes", alignment: "center" },
          { name: "offset", alignment: "center" },
          { name: "type", alignment: "center" },
          { name: "idx", alignment: "center" },
          { name: "artifact", alignment: "center" }
        ]
      });

      try {
        for (const contract of this.table) {
          for (const stateVariable of contract.stateVariables) {
            p.addRow({
              contract: contract.name,
              state_variable: stateVariable.name,
              storage_slot: stateVariable.slot,
              numberOfBytes: stateVariable.numberOfBytes,
              offset: stateVariable.offset,
              type: stateVariable.type,
              idx: stateVariable.idx,
              artifact: stateVariable.artifact
            });
          }
        }
        p.printTable();
      } catch (e) {
        console.log(e); // TODO HRE error handler
      }
    }
  }
}
