"use client";

import { useState } from "react";

const Signup = () => {
  const [orgName, setOrgName] = useState("");
  return (
    <form className="flex flex-col gap-16">
      <div className="flex flex-col gap-2">
        <label className="text-xl italic" htmlFor="orgName">
          Org Name
        </label>
        <input
          className="w-40 border text-xl px-3 py-1"
          id="orgName"
          type="text"
          name="orgName"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
      </div>
      <button
        className="border-indigo-500 border-dashed hover:cursor-pointer hover:shadow-indigo-50 hover:shadow-md border-2 p-2"
        type="submit"
      >
        Create Organisation
      </button>
    </form>
  );
};

export default Signup;
