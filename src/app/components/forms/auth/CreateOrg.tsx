"use client";

import { useActionState } from "react";
import { Input } from "../../atoms/Input";
import { createOrg, State } from "@/src/app/actions/Identity/createOrg";
import Button from "../../atoms/Button";

const CreateOrg = () => {
  const initialState: State = {
    fields: {
      orgName: "",
      adminName: "",
      email: "",
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
          errors={state.errors?.password}
          label="Password"
          id="password"
          name="password"
        />
        <Input
          errors={state.errors?.confirmPassword}
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
        />
        <Button type="submit" disabled={isPending}>
          Create Organisation
        </Button>
      </form>
    </div>
  );
};

export default CreateOrg;
