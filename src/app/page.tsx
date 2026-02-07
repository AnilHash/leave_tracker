import Link from "next/link";

export default function Home() {
  return (
    <main className="">
      <Navbar />
      <section className="flex h-52 justify-center items-center">
        <h1 className="text-4xl">Leave Tracker for Organisation</h1>
      </section>
    </main>
  );
}

function Navbar() {
  return (
    <nav className="w-full flex justify-between px-4 items-center  bg-amber-300 text-black">
      <section>
        <Logo />
      </section>
      <section className="m-4 flex gap-4 font-semibold">
        <Link
          href="/"
          className="px-4 py-1 rounded-md hover:bg-gray-400 duration-400"
        >
          Homepage
        </Link>
        <Link
          href="sign-in"
          className="px-4 py-1 rounded-md hover:bg-gray-400 duration-400"
        >
          Sign-in
        </Link>
        <Link
          href="sign-up"
          className="px-4 py-1 rounded-md hover:bg-gray-400 duration-400"
        >
          Sign-up
        </Link>
        <Link
          href="create-organisation"
          className="px-4 py-1 rounded-md hover:bg-gray-400 duration-400"
        >
          Create Org
        </Link>
      </section>
    </nav>
  );
}
function Logo() {
  return (
    <div>
      <Link href="/" className="text-xl font-bold italic">
        Leave Tracker
      </Link>
    </div>
  );
}
