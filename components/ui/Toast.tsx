import { FC, JSX } from "react";
import { CircleX } from 'lucide-react';

interface INFToastProps {
  title: string;
  message: string;
  icon: JSX.Element;
  closeCallback: () => void;
}

const Toast: FC<INFToastProps> = ({
  title = "Success",
  message,
  icon,
  closeCallback,
}) => {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-3 flex-1 pt-0.5">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{message}</p>
      </div>
      <div className="ml-4 flex flex-shrink-0">
        <button
          type="button"
          className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => closeCallback()}
        >
          <span className="sr-only">Close</span>
          <CircleX className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
