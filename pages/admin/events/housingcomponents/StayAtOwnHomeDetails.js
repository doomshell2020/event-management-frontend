import React, { useEffect, useState, useRef } from 'react';

const RentHouseDetails = ({ eventId, status, onSelectionChange, comesData, userId }) => {



  const [housingData, setHousingData] = useState(null);
  const [selectedHousingIds, setSelectedHousingIds] = useState('');
  // console.log('userId', userId);

  useEffect(() => {
    if (comesData && comesData.selectedHousingIds) {
      setSelectedHousingIds([...comesData.selectedHousingIds].join(','));
    }
  }, [comesData]);

  const handleRadioChange = (event, housingId) => {
    setSelectedHousingIds(String(housingId));
    // onSelectionChange({ bedroom: String(housingId) });
  };



  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchHousingData(status, eventId);
      if (!data.success) {
        setHousingData(null);
        return;
      }

      const groupedByBedrooms = {};

      data.data.forEach((housing) => {

        const offeredUsers = data.getOfferUsers
          .filter(user => {
            const housingIds = user.EligibleHousingIDs.split(',').map(Number);
            return housingIds.includes(housing.ID);
          })
          .map(user => {
            if (user.User) {
              const offerDate = user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-GB') // 'en-GB' gives DD-MM-YYYY format
                : null;

              return {
                FirstName: user.User.FirstName,
                LastName: user.User.LastName,
                offerDate: offerDate,
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
    };

    fetchData();
  }, [eventId, status]);


  async function fetchHousingData(status, eventId) {

    try {
      const response = await fetch(
        `/api/v1/housings?HousingByStatus=${status}&eventId=${eventId}&userId=${userId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching housing data:", error);
    }
  }


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



  return (
    <div className="row gy-3">
      {Object.keys(housingData).map((key) => {
        const housingList = housingData[key];
        return (
          <div className="col-sm-6 col-12" key={key}>
            <div className="elig-hsing-inr">
              <div className="elig-hsing-hd">
                <h6>{key.replace('bedroom', ' Bedrooms')}</h6>
              </div>
              {housingList.map((housing) => (
                <div
                  className="border-dark border-bottom d-flex p-2"
                  key={housing.ID}
                >
                  <label className={`me-2 ${housing.ID}`}>
                    <input
                      type="radio"
                      name="HomeOwnerHousingId"
                      onChange={(event) => handleRadioChange(event, housing.ID)}
                      checked={(selectedHousingIds || '').split(',').includes(String(housing.ID))}
                      required
                      value={housing.ID} // Set the value to the actual ID of the housing option
                    />
                    <span></span>
                  </label>
                  <div>
                    <h6>
                      {housing.Name}, {housing.Neighborhood}
                    </h6>
                    <p className="text-muted mb-0">
                      Max Occupancy: {housing.MaxOccupancy}, Nightly Price:
                      <span className="text-danger">
                        {' '}
                        {/* ${housing.EventHousings[0].NightlyPrice} USD */}
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
                        {housing.OfferedUser.map((index, member) => (
                          <p className="mb-0" key={index}>{`${member.FirstName}, ${member.FirstName} (Offered ${member.offerDate})`}</p>
                        ))}
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
  );

};

export default RentHouseDetails;
