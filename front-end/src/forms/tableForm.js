import React from "react";

export default function TableForm({ edit, form, changeHandler }) {
  if (edit === false) {
    return (
      <>
        <div class="formGroup">
          <input
            type="text"
            id="table_name"
            name="table_name"
            value={form.table_name}
            required={true}
            placeholder="Table Name"
            onChange={changeHandler}
          />
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={form.capacity}
            required={true}
            placeholder="capacity"
            onChange={changeHandler}
          />
        </div>
      </>
    );
  }
}
