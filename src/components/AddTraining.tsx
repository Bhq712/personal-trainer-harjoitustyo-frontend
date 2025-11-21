import { useState } from "react";
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import type { Customer } from "../types";
import { saveTraining } from "../trainingApi";

type AddTrainingProps = {
  customers: Customer[];
  fetchTrainings: () => void;
};

export default function AddTraining({ customers, fetchTrainings }: AddTrainingProps) {
  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!activity || !duration || !date) {
      alert("Please fill in all fields!");
      return;
    }

    const customerLink = customers[0]._links.self.href;

    try {
      await saveTraining({
        date: date.toISOString(),
        activity,
        duration: Number(duration),
        customer: customerLink,
      });
      fetchTrainings();
      handleClose();
      setActivity("");
      setDuration("");
      setDate(dayjs());
    } catch (err) {
      console.error(err);
      alert("Failed to add training.");
    }
  };

  return (
    <>
      <Button variant="contained" size="small" onClick={handleOpen}>
        Add Training
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Training</DialogTitle>
        <DialogContent>
          <TextField
            label="Activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Duration (min)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date & Time"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
