document.addEventListener('DOMContentLoaded', () => {
    const dateSelector = document.getElementById('dateSelector');
    const calendarContainer = document.getElementById('calendar-container');
    
    // Set date picker to today's date
    const today = new Date();
    dateSelector.valueAsDate = today;
    
    // Create and display initial calendar with selected date
    createCalendars(today);
    
    // Update calendar when date is changed
    dateSelector.addEventListener('change', (e) => {
        // Remove previous selected date class
        const previousSelected = document.querySelector('.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Create calendars with new selected date
        createCalendars(new Date(e.target.value));
    });
    
    function createCalendars(selectedDate) {
        calendarContainer.innerHTML = '';
        
        // Create grid container for months
        const gridContainer = document.createElement('div');
        gridContainer.className = 'calendar-grid';
        
        // Create previous month - fix the calculation
        const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
        gridContainer.appendChild(createMonthCalendar(prevMonth, selectedDate));
        
        // Create current month
        gridContainer.appendChild(createMonthCalendar(selectedDate, selectedDate));
        
        // Add stats box
        gridContainer.appendChild(createStatsBox(selectedDate));
        
        // Create next 60 months
        let nextDate = new Date(selectedDate);
        for (let i = 1; i <= 60; i++) {
            nextDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + i, 1);
            gridContainer.appendChild(createMonthCalendar(nextDate, selectedDate));
        }
        calendarContainer.appendChild(gridContainer);
    }
    
    function createMonthCalendar(date, selectedDate) {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-calendar';
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Add month and year header
        const monthHeader = document.createElement('h3');
        
        // Calculate if this is a future month (after current month)
        const monthDiff = (date.getFullYear() - selectedDate.getFullYear()) * 12 + 
                         (date.getMonth() - selectedDate.getMonth());
        
        // Add sequence number for future months, starting from 1
        if (monthDiff > 0) {
            const sequenceNumber = monthDiff;  // This will now start from 1 for the month after current
            monthHeader.innerHTML = `${monthNames[date.getMonth()]} ${date.getFullYear()}  <span class="sequence-number">(${sequenceNumber})</span>`;
        } else {
            monthHeader.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        }
        
        monthDiv.appendChild(monthHeader);
        
        // Changed weekdays array to start with Monday
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const table = document.createElement('table');
        table.className = 'calendar';
        
        // Create header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        weekdays.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create calendar body
        const tbody = document.createElement('tbody');
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        // Adjust starting day to Monday (0 = Monday, 6 = Sunday)
        let startingDayOfWeek = firstDay.getDay() - 1;
        if (startingDayOfWeek === -1) startingDayOfWeek = 6;
        const monthDays = lastDay.getDate();
        
        let day = 1;
        let lastFridayCount = null;  // Keep track of the last Friday's count div
        
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                
                if (i === 0 && j < startingDayOfWeek) {
                    cell.textContent = '';
                } else if (day > monthDays) {
                    cell.textContent = '';
                } else {
                    // Create a container for the cell content
                    const cellContent = document.createElement('div');
                    cellContent.style.width = '100%';
                    cellContent.style.height = '100%';
                    cell.appendChild(cellContent);

                    // Add events before the date (if any exist)
                    const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
                    const events = getEventsForDate(currentDate);
                    if (events.length > 0) {
                        const eventDiv = document.createElement('div');
                        eventDiv.className = 'event-text';
                        
                        if (events.length >= 3) {
                            // Create dot
                            const dotDiv = document.createElement('div');
                            dotDiv.className = 'event-dot';
                            
                            // Create tooltip content with newlines instead of <br>
                            const tooltipContent = events.map(event => 
                                `${event.text}: ${event.description}`
                            ).join('\n');
                            
                            // Add tooltip using title attribute
                            dotDiv.title = tooltipContent;
                            
                            eventDiv.appendChild(dotDiv);
                        } else {
                            // Show events as before for 1-2 events
                            events.forEach((event, index) => {
                                const eventSpan = document.createElement('span');
                                eventSpan.textContent = event.text;
                                eventSpan.title = event.description;
                                eventSpan.className = 'event-item';
                                
                                if (index > 0) {
                                    eventDiv.appendChild(document.createTextNode(', '));
                                }
                                eventDiv.appendChild(eventSpan);
                            });
                        }
                        
                        cellContent.appendChild(eventDiv);
                    }

                    // Add date number
                    const dateDiv = document.createElement('div');
                    dateDiv.className = 'date-number';
                    dateDiv.textContent = day;
                    cellContent.appendChild(dateDiv);

                    // Add day count
                    const countDiv = document.createElement('div');
                    countDiv.className = 'day-count';
                    
                    // Calculate day difference
                    const compareDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
                    const diffDays = Math.round((currentDate - compareDate) / (1000 * 60 * 60 * 24));
                    
                    // Check if this is a future date matching the selected date's day and month
                    const isFutureMatch = currentDate > compareDate && 
                                         currentDate.getDate() === selectedDate.getDate() && 
                                         currentDate.getMonth() === selectedDate.getMonth();

                    if (diffDays === 0) {
                        countDiv.textContent = '';
                    } else {
                        const absValue = Math.abs(diffDays);
                        countDiv.textContent = diffDays < 0 ? `-${absValue}` : absValue;
                        
                        // Add the future-match class if applicable
                        if (isFutureMatch) {
                            countDiv.classList.add('future-match');
                            
                            // Calculate years difference
                            const yearsDiff = (currentDate.getFullYear() - selectedDate.getFullYear()) +
                                             (currentDate.getMonth() - selectedDate.getMonth()) / 12;
                            
                            // Format to 1 decimal place if not a whole number
                            const formattedYears = yearsDiff % 1 === 0 ? 
                                yearsDiff : 
                                yearsDiff.toFixed(1);
                            
                            // Check if selected date is today
                            const isSelectedToday = selectedDate.getDate() === today.getDate() && 
                                                  selectedDate.getMonth() === today.getMonth() && 
                                                  selectedDate.getFullYear() === today.getFullYear();
                            
                            // Add tooltip with appropriate text
                            const tooltipText = isSelectedToday ? 
                                `${formattedYears} year${formattedYears === 1 ? '' : 's'} from today` :
                                `${formattedYears} year${formattedYears === 1 ? '' : 's'} from selected date`;
                            
                            countDiv.title = tooltipText;
                        }
                        
                        const isWeekend = j === 5 || j === 6;  // Saturday or Sunday
                        const isMultipleOf30 = absValue % 30 === 0;
                        
                        // If it's Friday, store the count div for potential weekend multiple
                        if (j === 4) {
                            lastFridayCount = countDiv;
                        }
                        
                        // Add multiple-30 class based on conditions
                        if (isMultipleOf30) {
                            if (isWeekend && lastFridayCount) {
                                // Move highlight to previous Friday
                                lastFridayCount.classList.add('multiple-30');
                            } else if (!isWeekend) {
                                // Regular case - highlight the current day
                                countDiv.classList.add('multiple-30');
                            }
                        }
                    }
                    
                    cellContent.appendChild(countDiv);

                    // Check if it's today
                    const isToday = day === today.getDate() && 
                                  date.getMonth() === today.getMonth() && 
                                  date.getFullYear() === today.getFullYear();
                    
                    // Check if it's selected date
                    const isSelected = day === selectedDate.getDate() && 
                                     date.getMonth() === selectedDate.getMonth() && 
                                     date.getFullYear() === selectedDate.getFullYear();
                    
                    // Adjust weekend check for Monday start (5 = Sat, 6 = Sun)
                    const isWeekend = j === 5 || j === 6;
                    
                    if (isToday) cell.classList.add('today');
                    if (isSelected) cell.classList.add('selected');
                    if (isWeekend) cell.classList.add('weekend');
                    
                    day++;
                }
                row.appendChild(cell);
            }
            
            tbody.appendChild(row);
            if (day > monthDays) break;
        }
        
        table.appendChild(tbody);
        monthDiv.appendChild(table);
        return monthDiv;
    }
    
    function getEventsForDate(date) {
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return eventData.events
            .filter(event => event.date === formattedDate);  // Return full event objects
    }
    
    function createStatsBox(selectedDate) {
        const statsBox = document.createElement('div');
        statsBox.className = 'stats-box';
        
        // Format the date
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weekday = weekdays[selectedDate.getDay()];
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const month = months[selectedDate.getMonth()];
        const year = selectedDate.getFullYear();
        
        // Add formatted date header
        const dateHeader = document.createElement('div');
        dateHeader.className = 'stats-header';
        dateHeader.innerHTML = `<strong>${weekday}, ${day} ${month} ${year}</strong>`;
        statsBox.appendChild(dateHeader);
        
        const currentYear = selectedDate.getFullYear();
        
        // Calculate total days in the year (accounts for leap years)
        const totalDaysInYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0 ? 366 : 365;
        
        // Get day of year (1-based)
        const startOfYear = new Date(currentYear, 0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        const selectedDateNormalized = new Date(selectedDate);
        selectedDateNormalized.setHours(0, 0, 0, 0);
        
        // Calculate days into year
        const daysIntoYear = 1 + Math.floor((selectedDateNormalized - startOfYear) / (1000 * 60 * 60 * 24));
        
        // Calculate days remaining (should sum to total days)
        const daysLeftInYear = totalDaysInYear - daysIntoYear;
        
        // Create stats items
        const daysIntoDiv = document.createElement('div');
        daysIntoDiv.className = 'stats-item';
        daysIntoDiv.innerHTML = `Days into ${currentYear}: <span class="stats-value">${daysIntoYear}</span>`;
        
        const daysLeftDiv = document.createElement('div');
        daysLeftDiv.className = 'stats-item';
        daysLeftDiv.innerHTML = `Days left in ${currentYear}: <span class="stats-value">${daysLeftInYear}</span>`;
        
        statsBox.appendChild(daysIntoDiv);
        statsBox.appendChild(daysLeftDiv);
        
        return statsBox;
    }
});
