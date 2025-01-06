"use client";
import { FC, useState } from "react";
import { classNames } from "utils/helper";
import { useRouter, usePathname } from "next/navigation";
import Pagination from "./Pagination";
import { useSWRConfig } from "swr";
import NoSearchResults from "./NoSearchResults";
interface INFDynamicList {
  data: any[];
  fields: string[];
  combineFieldsCallbacks?: {
    [key: string]: (value: any) => any;
  };
  fieldFormatter?: {
    [key: string]: (value: any) => any;
  };
  labelFormatter?: {
    [key: string]: (value: string) => any;
  };
  filters: boolean;
  filterOptions?: { [key: string]: any[] };
  mutateKey?: string;
  entity?: string;
  showEditButton?: boolean;
  entityButtonText?: string;
  readonly?: boolean;
  bulkActions?: {
    [key: string]: (value: any) => any;
  };
}

const DynamicList: FC<INFDynamicList> = ({
  data,
  fields,
  combineFieldsCallbacks,
  fieldFormatter,
  filters = true,
  filterOptions,
  labelFormatter,
  mutateKey,
  entity,
  showEditButton = false,
  entityButtonText,
  readonly = false,
  bulkActions,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterValues, setFilterValues] = useState<{ [key: string]: string[] }>(
    {}
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50; // Set the number of items per page
  const [checked, setChecked] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const router = useRouter();
  const path = usePathname();
  const { mutate } = useSWRConfig();

  //TODO: make this function more generic
  const bulkDelete = async (entity: string) => {
    if (!entity) return;

    try {
      const deletePromises = selectedData.map(async (object: any) => {
        const response = await fetch(`/api/${entity}/${object.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete ${object.id}: ${response.statusText}`);
        }

        return response;
      });

      await Promise.all(deletePromises);

      if (mutateKey) {
        mutate(mutateKey);
      }
    } catch (error) {
      console.error("Error in bulkDelete:", error);
    }
  };

  //returns manipulated value if callback is set e.g. for combining fields
  const checkFieldManipulationForFilter = (
    field: string,
    value: string,
    currentItem: any
  ) => {
    let manipulatedValue = value;
    if (combineFieldsCallbacks && combineFieldsCallbacks[field]) {
      manipulatedValue = combineFieldsCallbacks[field](currentItem);
    }
    if (fieldFormatter && fieldFormatter[field]) {
      manipulatedValue = fieldFormatter[field](manipulatedValue);
    }
    return manipulatedValue;
  };

  // Filter the data based on the search term
  const filteredData = data.filter((item) => {
    const searchTermMatch =
      searchTerm === "" ||
      fields.some((field) => {
        return checkFieldManipulationForFilter(field, item[field], item)
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLocaleLowerCase());
      });

    const filterValueMatches = Object.entries(filterValues).every(
      ([filterField, filterValue]) => {
        const itemValue = item[filterField];

        // Handle multiple filter values for a field
        if (Array.isArray(filterValue)) {
          return filterValue.length === 0 || filterValue.includes(itemValue);
        }

        return (
          filterValue === "" ||
          (itemValue && itemValue.toString().includes(filterValue))
        );
      }
    );

    return searchTermMatch && filterValueMatches;
  });

  // Calculate pagination variables
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = filteredData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  //returns manipulated value if callback is set e.g. for combining fields
  const checkFieldManipulation = (field: string, value: string, id: number) => {
    let manipulatedValue = value;
    if (combineFieldsCallbacks && combineFieldsCallbacks[field]) {
      manipulatedValue = combineFieldsCallbacks[field](currentItems[id]);
    }
    if (fieldFormatter && fieldFormatter[field]) {
      manipulatedValue = fieldFormatter[field](manipulatedValue);
    }
    return manipulatedValue;
  };

  // Handle search input change
  const handleSearch = (event: any) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset pagination to the first page
  };

  // Handle page change
  const handlePageChange = (page: any) => {
    setCurrentPage(page < 1 ? 1 : page > totalPages ? totalPages : page);
  };

  // Handle filter value change
  const handleCheckboxChange = (
    filterField: string,
    option: string,
    checked: boolean
  ) => {
    setFilterValues((prevValues) => {
      const prevFieldValues = prevValues[filterField] || [];
      let updatedFieldValues;

      if (checked) {
        updatedFieldValues = [...prevFieldValues, option];
      } else {
        updatedFieldValues = prevFieldValues.filter(
          (value) => value !== option
        );
      }

      return {
        ...prevValues,
        [filterField]: updatedFieldValues,
      };
    });

    setCurrentPage(1);
  };

  function toggleAll() {
    setSelectedData(checked ? [] : data);
    setChecked(!checked);
  }

  const renderBulkActions = () => {
    if (!bulkActions) return null;

    return Object.keys(bulkActions).map((key, index) => (
      <button
        key={key + index}
        type="button"
        className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
        onClick={() => bulkActions[key](selectedData)}
      >
        {key}
      </button>
    ));
  };

  return (
    <div>
      <div className="mt-8 flow-root">
        <div className="flex justify-between mb-4">
          {/*<SearchBar
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            placeholder="Suche..."
          />*/}
          <div className="mt-4 relative">
            {/*filters && filterOptions ? (
              <ListFilters
                filterOptions={filterOptions}
                handleFilterChange={handleCheckboxChange}
                filterValues={filterValues}
                fieldFormatter={fieldFormatter}
                labelFormatter={labelFormatter}
              />
            ) : null*/}
          </div>
        </div>
        {currentItems.length ? (
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="relative">
                {selectedData.length > 0 && (
                  <div className="absolute left-12 flex h-12 items-center space-x-3 bg-white z-10">
                    {!readonly ? (
                      <button
                        type="button"
                        className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                        onClick={() => bulkDelete(entity ?? "")}
                      >
                        Löschen
                      </button>
                    ) : null}
                    {renderBulkActions()}
                  </div>
                )}
                <table className="min-w-full table-fixed divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          checked={checked}
                          onChange={toggleAll}
                        />
                      </th>
                      {fields.map((field, index) => (
                        <th
                          scope="col"
                          className={classNames(
                            "py-3.5 text-left text-sm font-semibold text-gray-900 capitalize",
                            !index ? "pr-3" : "px-3",
                            !index && selectedData.length
                              ? "text-transparent"
                              : ""
                          )}
                          key={field + index}
                        >
                          {labelFormatter && labelFormatter[field]
                            ? labelFormatter[field](field)
                            : field}
                        </th>
                      ))}
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-3"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentItems.map((item, id) => (
                      <tr
                        key={item.id}
                        className={
                          selectedData.includes(item) ? "bg-gray-50" : undefined
                        }
                      >
                        <td className="relative px-7 sm:w-12 sm:px-6">
                          {selectedData.includes(item) && (
                            <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                          )}
                          <input
                            type="checkbox"
                            className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            value={data[0]}
                            checked={selectedData.includes(item)}
                            onChange={(e) =>
                              setSelectedData(
                                e.target.checked
                                  ? [...selectedData, item]
                                  : selectedData.filter((el) => el !== item)
                              )
                            }
                          />
                        </td>
                        {fields.map((field, index) => {
                          if (index === 0) {
                            return (
                              <td
                                key={`${item.id}-${field}`}
                                className={classNames(
                                  "whitespace-nowrap py-4 pr-3 text-sm font-medium capitalize",
                                  selectedData.includes(item)
                                    ? "text-indigo-600"
                                    : "text-gray-900"
                                )}
                              >
                                {checkFieldManipulation(field, item[field], id)}
                              </td>
                            );
                          }
                          return (
                            <td
                              className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                              key={`${item.id}-${field}`}
                            >
                              {checkFieldManipulation(field, item[field], id)}
                            </td>
                          );
                        })}
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                          {showEditButton ? (
                            <span
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => router.push(`${path}/${item.id}`)}
                            >
                              {entityButtonText
                                ? entityButtonText
                                : "Bearbeiten"}
                            </span>
                          ) : (
                            <></>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Pagination
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  currentPage={currentPage}
                  totalItems={data.length}
                />
              </div>
            </div>
          </div>
        ) : (
          <NoSearchResults />
        )}
      </div>
    </div>
  );
};

export default DynamicList;
