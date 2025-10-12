function CustomToast({
  text,
  className,
  type,
}: {
  text: string;
  className?: string;
  type?: "success" | "error" | "warning" | "info";
}) {
  let colorClass = "";

  switch (type) {
    case "success":
      colorClass = "bg-green-600 text-green-100!";
      break;
    case "error":
      colorClass = "bg-red-700 text-red-100!";
      break;
    case "warning":
      colorClass = "bg-yellow-500";
      break;
    case "info":
      colorClass = "bg-blue-500";
      break;
    default:
      colorClass = "";
  }

  return (
    <div className={`cartoonish-toast ${colorClass} ${className}`}>{text}</div>
  );
}

export default CustomToast;
