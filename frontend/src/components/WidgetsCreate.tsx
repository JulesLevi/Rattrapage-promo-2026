import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import "../App.css";
import axios from "axios";

const WidgetsCreate = ({ onCreate }: any) => {
  // is open state for the collapsible
  const [isOpen, setIsOpen] = React.useState(false);

  const [service, setService] = React.useState("");
  const [widget, setWidget] = React.useState("");
  const [params, setParams] = React.useState("");
  const [repos, setRepos] = React.useState([]);
  const [refreshRate, setRefreshRate] = React.useState(10);

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

  const submit = () => {
    console.log("submitted");
    onCreate(
      service,
      widget,
      ["hour", "github", "weather"],
      { hour: ["Paris", "London"], github: [], weather: [] },
      refreshRate,
      params
    );
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button type="submit">Add a new widget</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a widget</DialogTitle>
            <DialogDescription>
              Add a widget to your dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Widgets
              </Label>
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-[350px] space-y-2"
              >
                <CollapsibleTrigger asChild>
                  <div className="w-[180px]">
                    <Select
                      onValueChange={(e: any) => {
                        setIsOpen(true);
                        setService(e);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="hour">Heure ville</SelectItem>
                          <SelectItem value="github">Github</SelectItem>
                          <SelectItem value="weather">Weather</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <div className="w-[180px]">
                    {service !== "github" && <Input type="text" placeholder="" onChange={(e) => {
                      setWidget(e.currentTarget.value);
                    }} />}
                    {service === "github" && <Select
                      onValueChange={(e: any) => {
                        setIsOpen(true);
                        setWidget(e);
                      }}
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
                        setIsOpen(true);
                        setParams(e);
                      }}
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
                </CollapsibleContent>
                <div className="w-[180px]">
                  <Input
                    type="number"
                    placeholder="Refresh rate (in seconds)"
                    defaultValue={refreshRate}
                    onInput={(e) =>
                      setRefreshRate(parseInt(e.currentTarget.value))
                    }
                  />
                </div>
              </Collapsible>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={submit}
              type="submit"
              disabled={!service || !widget}
            >
              Add widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WidgetsCreate;
