import React, { useEffect, useState, useRef } from 'react';
import moment from "moment-timezone";

const RentHouseDetails = ({ eventId, status, userId, onSelectionChange, comesData, arrivalDate, departureDate }) => {
  const [housingData, setHousingData] = useState(null);
  const [selectedHousingIds, setSelectedHousingIds] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (comesData && comesData.selectedHousingIds) {
      setSelectedHousingIds([
        ...comesData.selectedHousingIds].join(','));
    }
  }, [comesData]);


  const fetchData = async () => {
    setLoading(true); // Start loader
    const data = await fetchHousingData(status, eventId, arrivalDate, departureDate);

    if (!data.success) {
      setHousingData(null);
      setLoading(false); // Stop loader
      return;
    }
    // console.log('>>>>>>>>>>>>', data);

    const groupedByBedrooms = {};
    data.data.forEach((housing) => {

      const offeredUsers = data.getOfferUsers
        .filter(user => {
          const housingIds = user.EligibleHousingIDs.split(',').map(Number);
          return housingIds.includes(housing.ID);
        })
        .map(user => {
          if (user.User) {
            return {
              FirstName: user.User.FirstName,
              LastName: user.User.LastName,
              offerDate: moment.utc(user.createdAt).format('DD-MMM-YYYY'),
            };
          }
        })
        .filter(Boolean); // Removes any undefined values

      // Add the offered users to the housing object
      // if (offeredUsers.length > 0) {
      housing.OfferedUser = offeredUsers;
      // }

      const key = `${housing.NumBedrooms}bedroom`;

      if (!groupedByBedrooms[key]) {
        groupedByBedrooms[key] = [];
      }
      groupedByBedrooms[key].push(housing);
    });
    setHousingData(groupedByBedrooms);
    setLoading(false); // Stop loader
  };

  useEffect(() => {
    fetchData();
  }, [eventId, status, arrivalDate, departureDate]);

  async function fetchHousingData(status, eventId, arrivalDate, departureDate) {
    try {
      let url = `/api/v1/housings?HousingByStatus=${status}&eventId=${eventId}&userId=${userId}`;
      // Add dates only if both are provided (not null or undefined or empty)
      if (arrivalDate && departureDate) {
        url += `&queryArrival=${arrivalDate}&queryDeparture=${departureDate}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching housing data:', error);
    }
  }


  const updateSelection = (updatedIds) => {
    const uniqueIds = [...new Set(updatedIds)].filter(id => id !== '');
    const updatedSelection = uniqueIds.join(',');
    setSelectedHousingIds(updatedSelection);
    onSelectionChange({ bedroom: updatedSelection });
  };

  const handleCheckboxChange = (event, housingId) => {
    const isChecked = event.target.checked;

    setSelectedHousingIds((prevSelected) => {
      const currentSelection = prevSelected || '';
      const currentSelectionArray = currentSelection.split(',').filter(id => id !== '');

      let updatedIds;

      if (isChecked) {
        updatedIds = [...currentSelectionArray, String(housingId)];
      } else {
        updatedIds = currentSelectionArray.filter(id => id !== String(housingId));
      }
      updateSelection(updatedIds);
      return updatedIds.join(',');
    });
  };

  const handleCheckAll = (housingList) => {
    const newSelectedIds = housingList.map(housing => String(housing.ID));

    setSelectedHousingIds((prevSelected) => {
      const currentSelection = prevSelected || '';
      const currentSelectionArray = currentSelection.split(',').filter(id => id !== '');

      const updatedIds = [...new Set([...currentSelectionArray, ...newSelectedIds])];
      updateSelection(updatedIds);
      return updatedIds.join(',');
    });
  };

  const handleUncheckAll = (housingList) => {
    const idsToUncheck = housingList.map(housing => String(housing.ID));

    setSelectedHousingIds((prevSelected) => {
      const currentSelection = prevSelected || '';
      const updatedIds = currentSelection.split(',').filter(id => id !== '' && !idsToUncheck.includes(id));
      updateSelection(updatedIds);
      return updatedIds.join(',');
    });
  };

  // State to track visibility of the offered members list
  const [visibleMembers, setVisibleMembers] = useState({});

  const toggleMembers = (housingID) => {
    setVisibleMembers((prevVisibleMembers) => ({
      ...prevVisibleMembers,
      [housingID]: !prevVisibleMembers[housingID],
    }));
  };

  if (!housingData) {
    return <div>No housing data available.</div>;
  }


  function formatSmartPrice(amount) {
    if (isNaN(amount)) return "Invalid amount";

    const isInteger = Number(amount) % 1 === 0;
    const formatted = isInteger
      ? Number(amount).toLocaleString()               // No decimals
      : Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return formatted;
  }

  return (
    <>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row gy-3">
          {Object.keys(housingData).map((key) => {
            const housingList = housingData[key];
            return (
              <div className="col-lg-6 col-12" key={key}>
                <div className="elig-hsing-inr">
                  <div className="elig-hsing-hd">
                    <h6>{key.replace('bedroom', ' Bedrooms')}</h6>
                    <div>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleCheckAll(housingList); }}>Check all</a> |
                      <a href="#" onClick={(e) => { e.preventDefault(); handleUncheckAll(housingList); }}>Uncheck all</a>
                    </div>
                  </div>
                  {housingList.map((housing) => (
                    <div
                      className="border-dark border-bottom d-flex p-2"
                      key={housing.ID}
                    >
                      <label className="ckbox me-2">
                        <input
                          // name='selectedHousing'
                          type="checkbox"
                          onChange={(event) => handleCheckboxChange(event, housing.ID)}
                          checked={(selectedHousingIds || '').split(',').includes(String(housing.ID))}
                          value={String(housing.ID)}
                        />
                        <span></span>
                      </label>
                      <div className="housing-info">
                        <h6>
                          {housing.Name}, {housing.HousingNeighborhood?.name}
                        </h6>
                        <p className="text-muted mb-0">
                          Max Occupancy: {housing.MaxOccupancy}, Nightly Price:
                          <span className="text-danger">
                            {' '}
                            ${formatSmartPrice(housing.EventHousings[0].NightlyPrice)} USD
                            {/* ${formatSmartPrice(housing.EventHousings[0].OwnerAmount)} USD */}
                          </span>
                        </p>
                        <p
                          className="text-danger mb-0"
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleMembers(housing.ID)}
                        >
                          • Offered to {housing.OfferedUser && housing.OfferedUser.length} members
                        </p>
                        {visibleMembers[housing.ID] && (
                          <div className="offered-members-list">
                            {
                              housing.OfferedUser.map((index, member) => (
                                <p className="mb-0" key={index}>{`${index.FirstName}, ${index.FirstName} (Offered ${index.offerDate})`}</p>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default RentHouseDetails;
