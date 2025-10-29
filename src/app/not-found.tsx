import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex h-52 w-full gap-8 flex-col items-center justify-center">
      <Image
        width={100}
        height={100}
        src="/assets/very-good.gif"
        alt="A very good GIF illustrating the error."
      />
      <p className="text-center text-xl">
        [404] Dear brain user, now I give you permission to use the navigation
        bar.
      </p>
    </div>
  );
}
