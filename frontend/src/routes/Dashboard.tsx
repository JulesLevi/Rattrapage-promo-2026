import React, { useEffect } from "react";
import "../App.css";
import WidgetsCreate from "../components/WidgetsCreate";
import { Button } from "../components/ui/button";
import axios from "axios";
import Widget from "@/components/Widget";

const Dashboard = () => {
  const [hasAccessToken, setHasAccessToken] = React.useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/user/has-access-token", {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          setHasAccessToken(response.data.hasAccessToken);
        }
      });
  }, []);

  const handleGithub = () => {
    axios.get("http://localhost:8080/api/auth/github").then((response) => {
      console.log(response);
      if (response.status === 200) {
        console.log("Redirecting to Github");
        window.location.href = response.data;
      }
    });
  };

  const onCreate = (
    service: string,
    widget: string,
    listService: any,
    listWidget: any,
    refreshRate: number,
    params: any
  ) => {
    const newList = [...listsWidget];

    const widgetsName: any = {
      nbRepo: "Nombre de repository public",
      nbRepoPrivate: "Nombre de repository privé",
      nbRepoIssue: "Nombre de issues",
    };

    newList.push({
      id: listsWidget.length + 1,
      widgetName: widgetsName[widget] || widget,
      service,
      widget,
      refreshRate,
      listService,
      listWidget,
      params,
    });
    setListsWidget(newList);
  };

  const handleDelete = (id: string) => {
    console.log("Deleting widget with id", id);
    const newList = listsWidget.filter((widget: any) => widget.id !== id);
    setListsWidget(newList);
  };

  const handleModify = (
    id: string,
    service: string,
    widget: string,
    refreshRate: number,
    listService: any,
    listWidget: any,
    params: any
  ) => {
    const widgetsName: any = {
      nbRepo: "Nombre de repository public",
      nbRepoPrivate: "Nombre de repository privé",
      nbRepoIssue: "Nombre de issues",
    };
    
    const newList = [...listsWidget];
    const index = newList.findIndex((widget: any) => widget.id === id);
    newList[index] = {
      id,
      widgetName: widgetsName[widget] || widget,
      service,
      widget,
      refreshRate,
      listService,
      listWidget,
      params,
    };
    setListsWidget(newList);
  };

  const [listsWidget, setListsWidget] = React.useState<any>([]);

  return (
    <>
      <div className="my-title">
        <h1>Your Widgets</h1>
      </div>
      <div className="my-login-github">
        <Button onClick={handleGithub} disabled={hasAccessToken}>
          Connect to Github
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "25vh",
        }}
      >
        <div>
          <div
            style={{
              backgroundColor: "grey",
            }}
          ></div>
        </div>
        <div
          style={{
            position: "relative",
            textAlign: "center",
          }}
        ></div>
        <div>
          <WidgetsCreate onCreate={onCreate} />
        </div>
      </div>
      <div className="my-column">
        <div className="my-row">
          {listsWidget.map((listWidget: any) => (
            <Widget
              className="my-widget"
              key={listWidget.id}
              widgetName={listWidget.widgetName}
              service={listWidget.service}
              widget={listWidget.widget}
              refreshRate={listWidget.refreshRate}
              params={listWidget.params}
              onDelete={() => handleDelete(listWidget.id)}
              onModify={(
                service: string,
                widget: string,
                refreshRate: number,
                params: any
              ) =>
                handleModify(
                  listWidget.id,
                  service,
                  widget,
                  refreshRate,
                  listWidget.listService,
                  listWidget.listWidget,
                  params
                )
              }
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;