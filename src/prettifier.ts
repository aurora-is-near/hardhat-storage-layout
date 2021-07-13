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
      console.error("Table has empty feilds");
    } else {
      const p = new Table();

      try {
        for (const contract of this.table) {
          for (const stateVariable of contract.stateVariables) {
            p.addRow({
              contract: contract.name,
              state_variable: stateVariable.name,
              slot: stateVariable.slot,
              offset: stateVariable.offset,
              type: stateVariable.type
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
