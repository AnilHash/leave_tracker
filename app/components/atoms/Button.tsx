import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
} from "react";
type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;
const Button = ({
  children,
  className,
  ...rest
}: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      className={
        "border-indigo-500 border-dashed hover:cursor-pointer hover:shadow-indigo-50 hover:shadow-md border-2 p-2" +
        (className || "")
      }
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
