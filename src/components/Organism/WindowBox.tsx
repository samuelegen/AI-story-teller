interface WindowBoxProps {
	title?: string;
	children?: React.ReactNode;
}

const WindowBox: React.FC<WindowBoxProps> = ({ title, children }) => (
    <div className="window-box">
        <h2>{title}</h2>
        <div className="content">{children}</div>
    </div>
);


export default WindowBox;
