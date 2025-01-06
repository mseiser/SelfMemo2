import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import { CircleX, CircleCheck } from "lucide-react";

export function useToast() {
  const success = (title: string, message: string) => {
    toast((t) => {
      return (
        <Toast
          title={title}
          message={message}
          closeCallback={toast.dismiss}
          icon={<CircleCheck className="h-6 w-6 text-green-400" />}
        />
      );
    });
  };

  const warning = (message: string) => {
    toast.success("Warning: " + message);
  };

  const error = (title: string, message: string) => {
    toast((t) => {
      return (
        <Toast
          title={title}
          message={message}
          closeCallback={toast.dismiss}
          icon={<CircleX className="h-6 w-6 text-red-400" />}
        />
      );
    });
  };

  const customToast = {
    success,
    warning,
    error,
  };

  return customToast;
}
