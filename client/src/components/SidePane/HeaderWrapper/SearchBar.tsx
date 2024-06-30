import { useState } from "react";
import { MdClose } from "react-icons/md";

const SearchBar: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  return (
    <div className="flex items-center bg-blue-gray-200 border-b border-gray-200 px-6 py-2">
      <div className="flex items-center border-b border-gray-200 pr-3 bg-white rounded w-full">
        <input
          className="flex-grow flex-shrink mr-2 py-2 px-4 bg-transparent focus:outline-none focus:ring-0"
          type="text"
          placeholder="Search here"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchText && (
          <MdClose
            className="cursor-pointer"
            onClick={() => setSearchText("")}
          />
        )}
      </div>
    </div>
  );
};

export default SearchBar;
