"use client";
import { useActionState } from "react";
import { Input } from "../../atoms/Input";
import { signIn } from "@/src/app/actions/Identity/signIn";
import Button from "../../atoms/Button";

const SignIn = () => {
  const initialState = {
    fields: {
      email: "",
      orgName: "",
    },
  };
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  return (
    <article className="grid place-items-center gap-10">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <form action={formAction} className="grid place-items-center gap-10">
        <Input
          defaultValue={state.fields?.orgName}
          errors={state.errors?.orgName}
          label="Organisation"
          id="orgName"
          name="orgName"
        />
        <Input
          defaultValue={state.fields?.email}
          errors={state.errors?.email}
          label="Email"
          id="email"
          name="email"
          type="email"
        />
        <Input
          errors={state.errors?.password}
          label="Password"
          id="password"
          name="password"
        />
        <Button type="submit" disabled={isPending}>
          SignIn
        </Button>
      </form>
    </article>
  );
};

export default SignIn;
