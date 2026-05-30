type AxisMarkProps = {
  className?: string;
  mono?: boolean;
};

export function AxisMark({ className, mono = true }: AxisMarkProps) {
  const stroke = mono ? "currentColor" : "#0F1115";

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 36C18 26.059 26.059 18 36 18C45.941 18 54 26.059 54 36C54 45.941 45.941 54 36 54C26.059 54 18 45.941 18 36Z"
        stroke={stroke}
        strokeWidth="6"
      />
      <path
        d="M66 84C66 74.059 74.059 66 84 66C93.941 66 102 74.059 102 84C102 93.941 93.941 102 84 102C74.059 102 66 93.941 66 84Z"
        stroke={stroke}
        strokeWidth="6"
      />
      <path d="M47 47L73 73" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
      <path d="M47 73L73 47" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
      <path
        d="M66 36C66 26.059 74.059 18 84 18C93.941 18 102 26.059 102 36C102 45.941 93.941 54 84 54C74.059 54 66 45.941 66 36Z"
        stroke={stroke}
        strokeWidth="6"
      />
      <path
        d="M18 84C18 74.059 26.059 66 36 66C45.941 66 54 74.059 54 84C54 93.941 45.941 102 36 102C26.059 102 18 93.941 18 84Z"
        stroke={stroke}
        strokeWidth="6"
      />
    </svg>
  );
}
