import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useEffect, useState } from "react";
import axios from "axios";
import { TaskTimer } from "tasktimer";

const Widget = ({
  widgetName,
  service,
  widget,
  refreshRate,
  params,
  onDelete,
  onModify,
}: any) => {
  const [description, setdescription] = useState("");

  const [timer, setTimer] = useState(new TaskTimer(1000 * refreshRate));

  useEffect(() => {
    if (refreshRate <= 0) {
      return;
    }

    timer.pause();

    const newTimer = new TaskTimer(1000 * refreshRate);

    newTimer.on("tick", () => {
      if (service === "hour") {
        axios
          .get(`http://worldtimeapi.org/api/timezone/Europe/${widget}`)
          .then((response) => {
            setdescription(response.data.datetime);
          });
      }
      if (service === "github") {
        if (widget === "nbRepoIssue") {
          axios
            .post(`http://localhost:8080/api/github/get-issue`, { repo: params }, {
              withCredentials: true,
            })
            .then((response) => {
              setdescription(`Nombre de issues: ${response.data.length}`);
            });
        }
      }
      if (service === "weather") {
        axios
          .post(
            "http://localhost:8080/api/weather",
            { q: widget },
            { withCredentials: true }
          )
          .then((response) => {
            setdescription(
              `Temperature: ${response.data.current.temp_c}°C, Humidity: ${response.data.current.humidity}%`
            );
          });
      }
    });

    newTimer.start();

    setTimer(newTimer);
  }, [service, widget, refreshRate, params]);

  const [repos, setRepos] = useState([]);
  
  useEffect(() => {
    if (service === "github") {
      axios.get(`http://localhost:8080/api/github/get-repos`, {
        withCredentials: true,
      }).then((response) => {
        console.log(response.data);
        setRepos(response.data);
      });
    }
  }, [service]);

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>{widgetName}</CardTitle>
        <h1 style={{ "fontWeight": "bold" }}>{description}</h1>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Service</Label>
            <Select
              defaultValue={service}
              onValueChange={(e: any) => {
                timer.pause();
                onModify(e, widget, refreshRate);
              }}
            >
              <SelectTrigger id="framework">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="hour">Heure ville</SelectItem>
                <SelectItem value="github">Github</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="framework">Widget</Label>
            {service !== "github" && <Input type="text" placeholder="" onChange={(e) => {
              timer.pause();
              onModify(service, e.target.value, refreshRate, params);
            }} defaultValue={widget} />}
            {service === "github" && <Select
              onValueChange={(e: any) => {
                timer.pause();
                onModify(service, e, refreshRate, params);
              }}
              defaultValue={widget}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a widget" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="nbRepoIssue">Nombre de issues</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>}
            {service === "github" && <Select
              onValueChange={(e: any) => {
                timer.pause();
                onModify(service, widget, refreshRate, e);
              }}
              defaultValue={params}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a widget" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {repos.map((repo: any) => {
                    return <SelectItem value={repo.name}>{repo.name}</SelectItem>;
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>}

          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="framework">Refresh rate</Label>
            <Input
              type="number"
              defaultValue={refreshRate}
              onInput={(e) => {
                timer.pause();
                onModify(service, widget, parseInt(e.currentTarget.value), params);
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="destructive"
          onClick={() => {
            timer.pause();
            onDelete();
          }}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Widget;
