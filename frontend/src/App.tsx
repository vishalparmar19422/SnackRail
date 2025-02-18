import axios from "axios";
import { useEffect, useState } from "react";
import { Train, Search, Clock, MapPin } from "lucide-react";

interface Schedule {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  routeNumber: string;
  haltTime: string;
  distance: string;
  dayCount: string;
  stnSerialNumber: string;
  boardingDisabled: string;
}

interface TrainData {
  trainNumber: string;
  trainName: string;
  stationFrom: string;
  stationTo: string;
  runningOn: string;
  schedule: Schedule[];
  origin: string;
  destination: string;
}

const apiKeys = [
  import.meta.env.VITE_RAPIDAPI_KEY_1,
  import.meta.env.VITE_RAPIDAPI_KEY_2,
  import.meta.env.VITE_RAPIDAPI_KEY_3,
];

function App() {
  const [trainData, setTrainData] = useState<TrainData[]>([]);
  const [trainNo, setTrainNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentKeyIndex, setCurrentKeyIndex] = useState<number>(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const options = {
    method: "GET",
    url: `${import.meta.env.VITE_RAPIDAPI_URL}/${trainNo}`, // Dynamic trainNo
    params: {
      isH5: "true",
      client: "web",
    },
    headers: {
      "x-rapidapi-key": apiKeys[currentKeyIndex],
      "x-rapidapi-host": import.meta.env.VITE_RAPIDAPI_HOST,
      "x-rapid-api": "rapid-api-database",
    },
  };

  const getRailData = async () => {
    try {
      if (errorCount > 3) {
        setIsButtonDisabled(true);
      }
      setLoading(true);
      setError("");
      const res = await axios.request(options);
      setTrainData(res.data.body[0].trains);
    } catch (error: any) {
      if (error.status == 429) {
        setErrorCount((prev) => prev + 1);

        // Switch to the next API key
        setCurrentKeyIndex((prevIndex) => (prevIndex + 1) % apiKeys.length);
      }
      console.log("error while fetching data from api ", error.status);
      setError("Failed to fetch train data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (trainNo) {
      getRailData(); // Fetch data after API key changes
    }
  }, [currentKeyIndex]); // Triggered when currentKeyIndex changes

  const getDayStatus = (runningDays: string, index: number) => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const dayStatus = runningDays.split("").map((status) => status === "Y");
    return dayStatus[index];
  };

  const getDayName = (index: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[index];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2">
            <Train size={32} />
            <h1 className="text-2xl font-bold">Indian Railways Info</h1>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter Train Number"
                value={trainNo}
                onChange={(e) => setTrainNo(e.target.value)}
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={getRailData}
              disabled={loading || isButtonDisabled}
            >
              {loading ? "Searching..." : "Search"}
              <Train size={20} />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {/* If No Data */}
      {!trainData.length && !loading && !error && (
        <div className="h-screen flex items-center justify-center">
          <h1 className="text-gray-700 text-xl font-semibold">
            No train data found. Please enter a valid train number.
          </h1>
        </div>
      )}

      <div className="container mx-auto px-4 pb-12">
        {trainData.map((train) => (
          <div
            key={train.trainNumber}
            className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-6"
          >
            <div className="p-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {train.trainName}
                    </h2>
                    <p className="text-gray-600">
                      Train No: {train.trainNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Running Days</p>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                        <div
                          key={index}
                          className={`flex flex-col items-center rounded px-2 py-1 ${
                            getDayStatus(train.runningOn, index)
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-400 opacity-50"
                          }`}
                        >
                          <span className="text-xs font-medium">
                            {getDayName(index)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">From</p>
                    <p className="font-semibold text-gray-900">
                      {train.origin}
                    </p>
                  </div>
                  <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300 relative">
                    <Train
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600"
                      size={24}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">To</p>
                    <p className="font-semibold text-gray-900">
                      {train.destination}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Schedule</h3>
                <div className="space-y-4">
                  {train.schedule.map((stop, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    >
                      <div className="w-8 flex justify-center mt-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {stop.stationName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Station Code: {stop.stationCode}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Day {stop.dayCount}
                            </p>
                            <p className="text-sm text-gray-500">
                              Distance: {stop.distance} km
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-600" />
                            <span className="text-sm">
                              Arrival:{" "}
                              <span className="font-medium">
                                {stop.arrivalTime !== "--"
                                  ? stop.arrivalTime
                                  : "Origin"}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-600" />
                            <span className="text-sm">
                              Departure:{" "}
                              <span className="font-medium">
                                {stop.departureTime !== "--"
                                  ? stop.departureTime
                                  : "Destination"}
                              </span>
                            </span>
                          </div>
                          {stop.haltTime !== "--" && (
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-blue-600" />
                              <span className="text-sm">
                                Halt:{" "}
                                <span className="font-medium">
                                  {stop.haltTime}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
