# airness-airlines

## A Web Application Project for the course **COMP 20093** - *Information Management* from Polytechnic University of the Philippines.

---

To install all dependencies, run:  
`pip install -r requirements.txt`

The application requires `db.yaml` to be created on your local machine to connect to your own MySQL server. 

**db.yaml** should contain:
|  **KEY**  |      **VALUE**     |
|-----------|--------------------|
| HOSTNAME: |  *your-host-name*  |
| DB_USER:  |  *your-db-user*    |
| DB_PASS:  |  *your-password*   |
| DB_NAME:  |  *your-db-name*    |

To create the database needed in the application, run the following SQL queries in any of your preferred workbench or SQL editor:

**Passengers Table**
~~~~sql
CREATE TABLE passengers (
  PassengerId CHAR(4),
  FirstName VARCHAR(30) NOT NULL,
  MiddleName VARCHAR(20),
  LastName VARCHAR(20) NOT NULL,
  PassportNo VARCHAR(16) UNIQUE,
  IssueDate DATE,
  ExpDate DATE,
  BirthDate DATE NOT NULL,
  AgeGroup CHAR(6) NOT NULL,
  PRIMARY KEY (PassengerId)
);
~~~~

**Flights Table**
~~~~sql
CREATE TABLE flights (
  FlightNo CHAR(7),
  ETA DATE NOT NULL,
  ETD DATE NOT NULL,
  Duration TIME NOT NULL,
  Source VARCHAR(70) NOT NULL,
  Destination VARCHAR(70) NOT NULL,
  PRIMARY KEY (FlightNo)
);
~~~~

**Tickets Table**
~~~~sql
CREATE TABLE tickets (
  TicketId CHAR(4),
  AccountName VARCHAR(70) NOT NULL,
  ModeOfPayment CHAR(10) NOT NULL,
  AccountNumber VARCHAR(16) NOT NULL,
  ExpDate DATE,
  ContactNo VARCHAR(15) NOT NULL,
  PassengerCount INT NOT NULL,
  TotalFare DECIMAL(10, 2) NOT NULL,
  FlightNo CHAR(7) NOT NULL,
  FlightDate DATE NOT NULL,
  PRIMARY KEY (TicketId),
  FOREIGN KEY (FlightNo) REFERENCES flights(FlightNo)
);
~~~~

**Seats Table**
~~~~sql
CREATE TABLE seats (
  SeatId CHAR(4),
  AirlineClass CHAR(8) NOT NULL,
  Extras CHAR(8),
  PRIMARY KEY (SeatId)
);
~~~~

**RESERVATIONS Table *(master table)***
~~~~sql
CREATE TABLE reservations (
  PassengerId CHAR(4),
  TicketId CHAR(4),
  SeatId CHAR(4),
  PRIMARY KEY (PassengerId, TicketId, SeatId),
  FOREIGN KEY PassengerId REFERENCES passengers(PassengerId),
  FOREIGN KEY TicketId REFERENCES tickets(TicketId),
  FOREIGN KEY SeatId REFERENCES seats(SeatId)
);
~~~~

