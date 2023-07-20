from . import mysql
from .query import primary_key
import random
import string

# Generate a random date within a given range (year_start - year_end)
def generate_random_date(year_start, year_end):
    month = random.randint(1, 12)
    day = random.randint(1, 28)  # Assuming all months have 28 days for simplicity
    year = random.randint(year_start, year_end)
    return f'{year}-{month:02d}-{day:02d}'

def generate_seat_number():
    row_number = random.randint(1, 6)
    column_letter = random.choice("ABCDEFGHIJK")
    return f"{row_number:02d}{column_letter}"

itinerary_codes = [
    'I0REQC', 'I0V5V9', 'I0WGUU', 'I1UGA9', 'I2K321', 'I2L5E5', 'I39SUG', 'I3PU2K',
    'I3SH9N', 'I3U2TP', 'I4417T', 'I49KQG', 'I4E6U3', 'I4QP6R', 'I5Q6Q1', 'I5TWFX',
    'I6A119', 'I6O3ZS', 'I6U9M2', 'I6YJHV', 'I72K35', 'I7H6U7', 'I7NI7F', 'I7NWHQ',
    'I8NEQ2', 'I90JR3', 'I92CDA', 'I97QRM', 'I9XQXD', 'IAFSFJ', 'IB6D7Q', 'IBC4NW',
    'IBCQ7S', 'IBV38L', 'IC2E21', 'ICBOLV', 'ICD17Y', 'ICDYN3', 'ICNOKR', 'IE8LR3',
    'IEJ6A0', 'IF231I', 'IF9S18', 'IFL8EX', 'IFRL0J', 'IFY50D', 'IG1C81', 'IG1T9M',
    'IGAK6J', 'IGHRIM', 'IGIUKZ', 'IGMDXR', 'IH4YHT', 'IH5AU0', 'IH9KI9', 'IHFI1L',
    'IHFT5S', 'IHX7C1', 'IHYWYI', 'IIDWRQ', 'IIFX8D', 'IJ2KPE', 'IJ3FVN', 'IJ5RDT',
    'IJTEAD', 'IJXMYX', 'IKN9LU', 'IKW05X', 'IL8MUN', 'ILBQ74', 'ILGR7R', 'IM3JXY',
    'IMHMLO', 'IMI2SW', 'IMIW8J', 'IMM4Z6', 'IMZFYX', 'IN7PA1', 'IND3FI', 'INU1DL',
    'IO1ZQA', 'IP116Y', 'IP185G', 'IP6U68', 'IPAMWV', 'IPWG44', 'IQ16EI', 'IQ1QOH',
    'IQ24PB', 'IQ465H', 'IQ5RE7', 'IQZ9XF', 'IR5PIQ', 'IRAWYW', 'IRBVRB', 'IRTCA1',
    'IRXYDZ', 'IS0O3T', 'ISRNZC', 'IT3B44', 'IT4NXB', 'IT7HW5', 'ITCD21', 'ITEU8H',
    'ITGO62', 'ITI9UA', 'ITJYA0', 'ITNNR7', 'ITOV7G', 'ITZSMI', 'IU1YK1', 'IUJ6AW',
    'IULWDC', 'IUTR8Z', 'IVMVWT', 'IVR2W8', 'IVZH7A', 'IW15ED', 'IWECSO', 'IWG5FJ',
    'IWI8Q9', 'IWJ356', 'IWZE11', 'IXPCD4', 'IXWW0K', 'IXXDJN', 'IYAS5J', 'IYEW5J',
    'IYODBI', 'IYQ8Z5', 'IZB9JJ', 'IZYZOO'
]

passenger_data = []
reservation_data = []

cursor = mysql.connection.cursor()

for _ in range(10):
    tickets = []
    ticket_id = primary_key('T', 'ticketId', 'ticket_t')
    account_name = random.choice(['John Smith', 'Emily Johnson', 'Michael Brown', 'Olivia Davis', 'William Miller'])
    mode_of_payment = random.choice(['GCash', 'Maya', 'PayPal', 'Visa', 'Mastercard'])
    account_number = ''.join(random.choices('0123456789', k=16))
    exp_date = generate_random_date('2023-01-01', '2030-12-31')
    contact_no = '+1' + ''.join(random.choices('0123456789', k=9))
    email_address = account_name.lower().replace(' ', '.') + '@gmail.com'
    total_fare = round(random.uniform(100.00, 1000.00), 2)
    airline_class = random.choice(['Economy', 'Business', 'First Class'])
    itinerary_code = random.choice(itinerary_codes)
    departure_date = generate_random_date('2023-08-15', '2023-12-31')

    passenger_count = random.randint(1, 4)


for _ in range(10):

    passenger_id = primary_key('P', 'passengerId', 'passenger_t')
    first_name = random.choice(['John', 'Emily', 'Michael', 'Olivia', 'William'])
    middle_name = random.choice(['', 'Rose', 'David', 'Michael', ''])
    last_name = random.choice(['Smith', 'Johnson', 'Brown', 'Davis', 'Miller'])
    passport_no = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    issue_date = generate_random_date(2019, 2023)
    exp_date = generate_random_date(2030, 2035)
    birth_date = generate_random_date(1970, 2005)
    age_group = 'Adult'

    passenger_data.append(passenger_id)

    cursor.execute(f'''
                INSERT INTO passenger_t
                VALUES ("{passenger_id}",
                            "{first_name}",
                            "{middle_name}",
                            "{last_name}",
                            "{passport_no}",
                            "{issue_date}",
                            "{exp_date}",
                            "{birth_date}",
                            "{age_group}");
                ''')
    
    seat_no = generate_seat_number()
    reservation_data.append((passenger_id, ticket_id, seat_no))

    cursor.execute(f'''
                   INSERT INTO reservation_t
                   VALUES (
                   "{passenger_id}",
                   "{ticket_id}",
                   "{seat_no}"
                   );
                   ''')


