import { DetailedHTMLProps, InputHTMLAttributes } from "react";

interface InputProps extends DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> {
  label?: string;
  errors?: string[];
}
export const Input = ({ label, errors, id, ...rest }: InputProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xl italic" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className="border text-xl px-3 py-1" {...rest} />
      {errors?.length && (
        <p className="text-red-500 text-md">
          {errors.map((err) => err + "\n")}
        </p>
      )}
    </div>
  );
};
