import React, { useEffect, useState } from "react";

import Auth from "./components/Auth/Auth";

import "./App.css";

function App() {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [inputUrl, setInputUrl] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingWebsite, setDeletingWebsite] = useState("");

  const init = async () => {
    var token = localStorage.getItem("token");
    if (!token) {
      setShowAuth(true);
      setPageLoaded(true);
      return;
    }
    setPageLoaded(true);
    setShowAuth(false);
    fetchAllWebsites();
  };

  const fetchAllWebsites = async () => {
    let token = localStorage.getItem("token");
    const res = await fetch("https://web-monitor-36a8.onrender.com/website", {
      method: "GET",
      headers: {
        authorization: token,
      },
    }).catch((err) => void err);
    setLoadingWebsites(false);
    if (!res) {
      return;
    }
    const data = await res.json();
    setWebsites(data.data);
  };

  const addWebsite = async () => {
    if (!inputUrl.trim() || submitButtonDisabled) return;
    setErrorMsg("");

    let token = localStorage.getItem("token");
    setSubmitButtonDisabled(true);
    const res = await fetch("https://web-monitor-36a8.onrender.com/website", {
      method: "POST",
      headers: {
        authorization: token,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        url: inputUrl,
      }),
    }).catch((err) => void err);
    setSubmitButtonDisabled(false);

    if (!res) {
      setErrorMsg("Error creating website");
      return;
    }
    const data = await res.json();

    if (!data.status) {
      setErrorMsg(data.message);
      return;
    }

    setInputUrl("");
    fetchAllWebsites();
  };

  const deleteWebsite = async (id) => {
    if (deletingWebsite) return;
    let token = localStorage.getItem("token");

    setDeletingWebsite(id);
    const res = await fetch(`https://web-monitor-36a8.onrender.com/website/${id}`, {
      method: "DELETE",
      headers: {
        authorization: token,
      },
    }).catch((err) => void err);
    setDeletingWebsite("");

    if (!res) return;

    fetchAllWebsites();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="app">
      {pageLoaded ? (
        showAuth ? (
          <Auth />
        ) : (
          <>
          <div className="inner-app">
          <button className="logOut" onClick = {() => {
            localStorage.removeItem('token')
            window.location.reload();
            }}
            >{"Log Out"}</button>

            <div className={"app-header"}>
              <p className="heading">Add Website for monitoring</p>

              <div className="elem">
                <label>Enter Website URL</label>
                <input
                  className="input"
                  placeholder="https://google.com"
                  value={inputUrl}
                  onChange={(event) => setInputUrl(event.target.value)}
                />
              </div>

              {errorMsg && <p className="error">{errorMsg}</p>}

              <button onClick={addWebsite} disabled={submitButtonDisabled}>
                {submitButtonDisabled ? "Adding..." : "Add"}
              </button>
            </div>

            <div className="body">
              <p className="heading">Your Websites</p>

              {loadingWebsites ? (
                <p>LOADING...</p>
              ) : (
                <div className={"cards"}>
                  {websites.length ? (
                    websites.map((item) => (
                      <div className={"card"} key={item._id}>
                        <div className="left">
                          <p
                            className={`link ${
                              item.isActive ? "green" : "red"
                            }`}
                          >
                            {item.isActive ? "ACTIVE" : "DOWN"}
                          </p>
                          <p className="url">{item.url}</p>
                        </div>

                        <div className="right">
                          <p
                            className="link red"
                            onClick={() => deleteWebsite(item._id)}
                          >
                            {deletingWebsite === item._id
                              ? "Deleting..."
                              : "Delete"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No Websites added!</p>
                  )}
                </div>
              )}
            </div>
          </div>
          </>
        )
      ) : (
        <div className="loading">
          <p>LOADING...</p>
        </div>
      )}
    </div>
  );
}

export default App;
