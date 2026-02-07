import CreateOrg from "../components/forms/auth/CreateOrg";

const page = () => {
  return (
    <section className="py-18 px-10 w-full flex flex-col gap-8 justify-center items-center">
      <h1 className="text-2xl font-bold">Create Organisation</h1>
      <CreateOrg />
    </section>
  );
};

export default page;
