"use client";

import { useActionState } from "react";
import { Input } from "../../atoms/Input";
import { createOrg, State } from "@/app/actions/Identity/createOrg";

const CreateOrg = () => {
  const initialState: State = {
    fields: {
      orgName: "",
      adminName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    message: null,
    errors: {},
  };
  const [state, formAction, isPending] = useActionState(
    createOrg,
    initialState,
  );
  return (
    <div className="w-full flex justify-center">
      <form
        className="flex flex-wrap gap-16 justify-center"
        action={formAction}
      >
        <Input
          defaultValue={state.fields?.orgName}
          errors={state.errors?.orgName}
          label="Org Name"
          id="orgName"
          type="text"
          name="orgName"
        />
        <Input
          defaultValue={state.fields?.adminName}
          errors={state.errors?.adminName}
          label="Admin Name"
          id="adminName"
          type="text"
          name="adminName"
        />
        <Input
          defaultValue={state.fields?.email}
          errors={state.errors?.email}
          label="Email"
          id="email"
          type="email"
          name="email"
        />
        <Input
          defaultValue={state.fields?.password}
          errors={state.errors?.password}
          label="Password"
          id="password"
          name="password"
        />
        <Input
          defaultValue={state.fields?.confirmPassword}
          errors={state.errors?.confirmPassword}
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
        />
        <button
          className="border-indigo-500 border-dashed hover:cursor-pointer hover:shadow-indigo-50 hover:shadow-md border-2 p-2"
          type="submit"
          disabled={isPending}
        >
          Create Organisation
        </button>
      </form>
    </div>
  );
};

export default CreateOrg;
