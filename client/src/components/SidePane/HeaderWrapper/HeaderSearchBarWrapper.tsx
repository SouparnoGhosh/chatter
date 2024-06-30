import SidePaneHeader from "./SidePaneHeader";

const HeaderSearchBarWrapper: React.FC = () => {
  return (
    <div className="sticky top-0 z-10 bg-white">
      <SidePaneHeader />
    </div>
  );
};

export default HeaderSearchBarWrapper;
