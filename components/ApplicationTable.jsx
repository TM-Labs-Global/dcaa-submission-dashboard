"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Funnel, Download, CaretDown, Calendar as CalendarIcon, X, CaretLeft, CaretRight, DotsThree } from "@phosphor-icons/react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Helper function to extract flattened values
const getFieldValue = (app, keyPath, fallback = "N/A") => {
  const raw = app.raw_data || {};
  const userInputs = raw.__submission?.user_inputs || raw.user_inputs || raw.response || {};
  if (userInputs && userInputs[keyPath]) {
    return userInputs[keyPath];
  }
  return raw[keyPath] || fallback;
};

const STREAMS = [
  "Stream 1 (Scriptwriting)",
  "Stream 2 (Directing)",
  "Stream 3 (Production)",
  "Stream 4 (Editing)",
  "Stream 5 (AI Filmmaking)",
  "Stream 6 (Acting)"
];

export function ApplicationTable({ applications }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStream = searchParams.get("stream") || "all";

  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedStream, setSelectedStream] = useState(urlStream);
  const [subStreamFilter, setSubStreamFilter] = useState("all");
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [openDialogId, setOpenDialogId] = useState(null);
  
  // Store dates keyed by stream name to preserve filter state across navigation
  const [streamDates, setStreamDates] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Reset pagination to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStream, subStreamFilter, streamDates, activeStatusTab]);

  // Get the current active date for the selected stream
  const date = streamDates[selectedStream] || { from: undefined, to: undefined };

  // Helper to update the date for the currently selected stream
  const setDate = (newDate) => {
    setStreamDates(prev => ({
      ...prev,
      [selectedStream]: typeof newDate === 'function' ? newDate(prev[selectedStream]) : newDate
    }));
  };

  useEffect(() => {
    setSelectedStream(urlStream);
    setSubStreamFilter("all");
    setActiveStatusTab("all");
    // Date is intentionally NOT wiped here anymore. Changing selectedStream
    // automatically pulls the correct historical date from streamDates.
  }, [urlStream]);

  if (!applications || applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-xl border-hairline bg-canvas">
        <p className="text-muted-foreground font-medium">No applications found yet.</p>
      </div>
    );
  }

  // 2. Filter applications based on selected stream and date (Base Filter for Counts)
  const baseFilteredApplications = applications.filter((app) => {
    // Stream Match
    const raw = app.raw_data || {};
    const userInputs = raw.__submission?.user_inputs || raw.user_inputs || raw.response || {};
    const stream = userInputs.input_radio || raw.input_radio || "N/A";
    
    let streamMatch = true;
    if (selectedStream !== "all") {
      streamMatch = stream === selectedStream;
    } else if (subStreamFilter !== "all") {
      streamMatch = stream === subStreamFilter;
    }

    // Date Match
    let dateMatch = true;
    if (date?.from) {
      const appDate = new Date(app.created_at);
      if (date.to) {
        dateMatch = isWithinInterval(appDate, {
          start: startOfDay(date.from),
          end: endOfDay(date.to),
        });
      } else {
        dateMatch = isWithinInterval(appDate, {
          start: startOfDay(date.from),
          end: endOfDay(date.from),
        });
      }
    }

    return streamMatch && dateMatch;
  });

  // 3. Calculate status counts
  const counts = {
    all: baseFilteredApplications.length,
    shortlisted: 0,
    rejected: 0,
    accepted: 0,
  };

  baseFilteredApplications.forEach(app => {
    const status = app.status || "pending";
    if (counts[status] !== undefined) counts[status]++;
  });

  // 4. Apply final Status filter
  const filteredApplications = baseFilteredApplications.filter((app) => {
    let statusMatch = true;
    if (activeStatusTab !== "all") {
      const appStatus = app.status || "pending";
      statusMatch = appStatus === activeStatusTab;
    }

    return statusMatch;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // 3. Export to JSON helper (Client-side)
  const exportToJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredApplications, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dcaa_applications_${selectedStream === 'all' ? 'all' : selectedStream.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 4. Handle CSV / XLSX Export (Server-side API calls)
  const handleExport = (format) => {
    const params = new URLSearchParams({ stream: selectedStream, format });
    if (selectedStream === 'all' && subStreamFilter !== 'all') {
      params.append('subStream', subStreamFilter);
    }
    if (activeStatusTab !== 'all') {
      params.append('status', activeStatusTab);
    }
    if (date?.from) {
      params.append('dateFrom', date.from.toISOString());
      if (date.to) params.append('dateTo', date.to.toISOString());
    }
    window.location.href = `/api/applications/export?${params.toString()}`;
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setIsUpdatingStatus(true);
    setOpenDialogId(null); // Instantly close the modal
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      router.refresh(); // Refresh data from server
    } catch (err) {
      console.error(err);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Stream Filter & Search - Only show when viewing all streams */}
        {selectedStream === "all" ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className={cn("flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer w-full sm:w-[300px] justify-start text-left")}>
                <Funnel className="size-4 text-muted-foreground shrink-0" />
                <span className="truncate flex-1">{subStreamFilter === "all" ? "All Streams" : subStreamFilter}</span>
                <CaretDown className="size-3.5 opacity-60 shrink-0 ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[300px] max-h-60 overflow-y-auto">
                <DropdownMenuRadioGroup value={subStreamFilter} onValueChange={setSubStreamFilter}>
                  <DropdownMenuRadioItem value="all">All Streams</DropdownMenuRadioItem>
                  {STREAMS.map((stream) => (
                    <DropdownMenuRadioItem key={stream} value={stream}>
                      {stream}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div /> /* Empty div to maintain flex-between spacing if needed */
        )}

        {/* Date and Export Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger render={<Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[360px] justify-start text-left font-normal border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm px-3 py-2 h-auto cursor-pointer",
                  !date && "text-muted-foreground"
                )}
              />}>
                <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                <span className="truncate flex-1">
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </span>
                {date?.from && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDate({ from: undefined, to: undefined });
                    }}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-2 py-0.5 rounded transition-colors shrink-0 ml-2"
                  >
                    Clear <X className="size-3" weight="bold" />
                  </div>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Export Dropdown */}
          <DropdownMenu>
          <DropdownMenuTrigger className={cn("flex justify-center sm:justify-start items-center gap-1.5 rounded-md border border-primary bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer w-full sm:w-auto")}>
            <Download aria-hidden="true" size={16} />
            Export
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('xlsx')} className="cursor-pointer">
              Export as Excel (xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToJSON} className="cursor-pointer">
              Export as JSON Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-hairline/60 hide-scrollbar pt-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'shortlisted', label: 'Shortlisted' },
          { id: 'rejected', label: 'Rejected' },
          { id: 'accepted', label: 'Accepted' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatusTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors",
              activeStatusTab === tab.id 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            <span>{tab.label}</span>
            <span className={cn(
              "px-2 py-0.5 text-[10px] rounded-full font-bold",
              activeStatusTab === tab.id 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="border border-hairline rounded-xl bg-canvas shadow-soft-lift overflow-x-auto">
        <Table className="table-fixed min-w-full md:min-w-[1020px] w-full">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[120px] hidden md:table-cell">Date</TableHead>
              <TableHead className="w-full md:w-[220px]">Applicant</TableHead>
              <TableHead className="w-[120px] hidden md:table-cell">Status</TableHead>
              <TableHead className="w-[120px] hidden md:table-cell">Country</TableHead>
              <TableHead className="w-[160px] hidden md:table-cell">Stream</TableHead>
              <TableHead className="w-[80px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-medium">
                  No applications found matching the selected stream.
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((app) => {
                // Extract the core fields based on Fluent Forms standard keys
                const raw = app.raw_data || {};
                const userInputs = raw.__submission?.user_inputs || raw.user_inputs || raw.response || {};
                
                // Name can be an object or string
                let name = "N/A";
                if (typeof userInputs.names === 'string') {
                  name = userInputs.names;
                } else if (userInputs.names && userInputs.names.first_name) {
                  name = `${userInputs.names.first_name || ''} ${userInputs.names.last_name || ''}`.trim();
                } else if (raw.names) {
                  name = `${raw.names.first_name || ''} ${raw.names.last_name || ''}`.trim();
                } else if (raw.first_name) {
                  name = raw.first_name; // Fallback for simple tests
                }

                const email = app.email || raw.email || "N/A";
                const country = userInputs['country-list'] || raw['country-list'] || "N/A";
                const phone = userInputs.phone_1 || raw.phone_1 || "N/A";
                const occupation = userInputs.input_text || raw.input_text || "N/A";
                const stream = userInputs.input_radio || raw.input_radio || "N/A";

                // Find any submitted links or extra fields for the modal
                const submittedLinks = Object.entries(userInputs)
                  .filter(([key, val]) => key.startsWith('url') && val)
                  .map(([_, val]) => val);
                  
                const actingExperience = userInputs.input_text_1;
                const actedBefore = userInputs.input_radio_1;
                const imageUpload = userInputs['image-upload'];

                const dateStr = app.created_at ? format(new Date(app.created_at), "MMM d, yyyy") : "N/A";
                
                const appStatus = app.status || "pending";
                const getStatusBadge = (status) => {
                  switch (status) {
                    case 'accepted': return <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-1 text-[11px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">● Accepted</span>;
                    case 'shortlisted': return <span className="inline-flex items-center rounded-full bg-yellow-500/15 px-2 py-1 text-[11px] font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">● Shortlisted</span>;
                    case 'rejected': return <span className="inline-flex items-center rounded-full bg-red-500/15 px-2 py-1 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20">● Rejected</span>;
                    default: return <span className="inline-flex items-center rounded-full bg-gray-500/15 px-2 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">● Not Evaluated</span>;
                  }
                };

                return (
                  <TableRow key={app.id}>
                    <TableCell className="w-[120px] max-w-[120px] text-muted-foreground truncate hidden md:table-cell">{dateStr}</TableCell>
                    <TableCell className="w-full md:w-[220px] md:max-w-[220px]">
                      {/* Mobile Date Subtitle */}
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5 md:hidden">{dateStr}</div>
                      
                      <div className="font-heading font-bold text-base md:text-lg text-foreground truncate">{name}</div>
                      
                      {/* Desktop Email Subtitle instead of Occupation */}
                      {email && email !== "N/A" && (
                        <div className="text-xs text-muted-foreground font-normal mt-0.5 truncate hidden md:block" title={email}>{email}</div>
                      )}
                      
                      {/* Mobile Status Subtitle */}
                      <div className="mt-1.5 md:hidden">
                        {getStatusBadge(appStatus)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="w-[120px] max-w-[120px] hidden md:table-cell">
                      {getStatusBadge(appStatus)}
                    </TableCell>
                    
                    <TableCell className="w-[120px] max-w-[120px] text-muted-foreground truncate hidden md:table-cell" title={country}>{country}</TableCell>
                    <TableCell className="w-[160px] max-w-[160px] text-muted-foreground truncate hidden md:table-cell" title={stream}>
                      {stream}
                    </TableCell>
                    
                    <TableCell className="w-[80px] text-right">
                      <div className="flex items-center justify-end">
                        <Dialog open={openDialogId === app.id} onOpenChange={(isOpen) => setOpenDialogId(isOpen ? app.id : null)}>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground outline-none">
                              <span className="sr-only">Open menu</span>
                              <DotsThree size={20} weight="bold" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px]">
                              <DialogTrigger asChild>
                                <DropdownMenuItem className="cursor-pointer">
                                  View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <div className="h-px bg-hairline my-1" />
                              <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Move to</div>
                              <DropdownMenuItem className="cursor-pointer" disabled={isUpdatingStatus} onClick={() => handleStatusUpdate(app.id, 'not_evaluated')}>Not Evaluated</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" disabled={isUpdatingStatus} onClick={() => handleStatusUpdate(app.id, 'shortlisted')}>Shortlisted</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" disabled={isUpdatingStatus} onClick={() => handleStatusUpdate(app.id, 'rejected')}>Rejected</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" disabled={isUpdatingStatus} onClick={() => handleStatusUpdate(app.id, 'accepted')}>Accepted</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-full sm:max-w-2xl max-h-[85vh] p-0 bg-popover border border-hairline rounded-2xl shadow-premium overflow-hidden mx-auto">
                          <div className="p-5 md:p-8 overflow-y-auto max-h-[85vh] w-full flex flex-col gap-6">
                            <DialogHeader className="mb-2 flex flex-row flex-wrap items-start justify-between w-full gap-4">
                              <div className="flex flex-col gap-1.5 text-left">
                                <DialogTitle className="font-heading text-2xl font-semibold text-foreground tracking-tight">
                                  Applicant Profile
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                  Submitted on <span suppressHydrationWarning>{app.created_at ? format(new Date(app.created_at), "MMMM d, yyyy 'at' h:mm a") : "N/A"}</span>
                                </DialogDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                                    Move To... <CaretDown className="ml-2 size-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, 'not_evaluated')}>
                                      Not Evaluated
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, 'shortlisted')}>
                                      Shortlisted
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, 'rejected')}>
                                      Rejected
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, 'accepted')}>
                                      Accepted
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <a 
                                  href={`mailto:${email}?subject=DCAA%20Application%20Update%20-%20${encodeURIComponent(name)}`}
                                  className={cn(buttonVariants({ variant: "default", size: "lg" }))}
                                >
                                  Contact
                                </a>
                              </div>
                            </DialogHeader>

                            {/* Name Details */}
                            <div className="bg-muted/30 rounded-xl p-4 border border-hairline/50 w-full">
                              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Full Name</h4>
                              <p className="text-lg font-semibold text-foreground break-words">{name}</p>
                            </div>

                            {/* Core Contact Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-b border-hairline pb-6 w-full">
                              <div className="min-w-0">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Email Address</h4>
                                <p className="text-sm font-medium text-body truncate" title={email}>{email}</p>
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Phone Number</h4>
                                <p className="text-sm font-medium text-body break-words">{phone}</p>
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Country</h4>
                                <p className="text-sm font-medium text-body break-words">{country}</p>
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Occupation</h4>
                                <p className="text-sm font-medium text-body break-words">{occupation}</p>
                              </div>
                            </div>

                            {/* Stream Selection */}
                            <div className="w-full">
                              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Selected Stream</h4>
                              <p className="text-base font-bold text-foreground">{stream}</p>
                            </div>

                            {/* Portfolio Links */}
                            {submittedLinks.length > 0 && (
                              <div className="space-y-3 pt-4 border-t border-hairline/60">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Portfolio / Drive Links</h4>
                                <div className="flex flex-col gap-2">
                                  {submittedLinks.map((linkUrl, index) => (
                                    <a
                                      key={index}
                                      href={linkUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block w-full truncate text-sm font-medium text-primary hover:underline border border-hairline/60 bg-muted/20 hover:bg-muted/40 p-2.5 rounded-lg transition-colors"
                                      title={linkUrl}
                                    >
                                      {linkUrl}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(actingExperience || actedBefore) && (
                              <div className="pt-4 border-t border-hairline/60 space-y-3">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Acting Details</h4>
                                {actingExperience && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Years of Experience</p>
                                    <p className="text-sm font-medium text-foreground break-words">{actingExperience}</p>
                                  </div>
                                )}
                                {actedBefore && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Acted in Mobile Format before?</p>
                                    <p className="text-sm font-medium text-foreground break-words">{actedBefore}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {imageUpload && (
                              <div className="pt-4 border-t border-hairline/60">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Uploaded Headshot / Image</h4>
                                <a 
                                  href={imageUpload} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 text-sm font-medium border border-hairline transition-colors"
                                >
                                  View Image File
                                </a>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>

    {/* Pagination Controls */}
    {totalPages > 1 && (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
          Showing <span className="font-medium text-foreground">{indexOfFirstItem + 1}</span> to <span className="font-medium text-foreground">{Math.min(indexOfLastItem, filteredApplications.length)}</span> of <span className="font-medium text-foreground">{filteredApplications.length}</span> results
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 p-0 bg-canvas cursor-pointer"
          >
            <CaretLeft className="size-4" />
          </Button>
          
          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground tracking-widest">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={cn("w-9 h-9 p-0 cursor-pointer", currentPage !== page && "bg-canvas hover:bg-muted")}
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 p-0 bg-canvas cursor-pointer"
          >
            <CaretRight className="size-4" />
          </Button>
        </div>
      </div>
    )}

    </div>
  );
}
