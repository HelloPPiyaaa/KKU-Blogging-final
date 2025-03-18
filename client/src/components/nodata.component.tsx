interface NoDataMessageProps {
  message: string;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ message }) => {
  return (
    <div className="text-center w-100 p-4 rounded-circle mt-4">{message}</div>
  );
};

export default NoDataMessage;
