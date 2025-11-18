import * as XLSX from 'xlsx';
import { Request } from 'express';
import User from '@/models/user';
import Client from '@/models/client';
import ClientAttendee from '@/models/clientAttendee';
import Meet from '@/models/meet';
import logger from '@/lib/logger';

// Export data to Excel
export const exportToExcel = async (
  dataType: string,
  refAdmin: string,
  filters?: { startDate?: Date; endDate?: Date; meetingTypeId?: string; clientId?: string }
) => {
  try {
    let data: any[] = [];
    let fileName = '';
    let sheetName = '';
    let headers: string[] | undefined = undefined;

    switch (dataType) {
      case 'users':
        data = await User.find({ refAdmin }).select('-password -__v').lean().exec();
        fileName = 'users.xlsx';
        sheetName = 'Users';
        break;

      case 'clients':
        data = await Client.find({ refAdmin }).select('-__v').lean().exec();
        fileName = 'clients.xlsx';
        sheetName = 'Clients';
        break;

      case 'client-attendees':
        data = await ClientAttendee.find({ refAdmin })
          .populate('clientId', 'username company')
          .select('-__v')
          .lean()
          .exec();
        // Flatten the populated data
        data = data.map(item => ({
          ...item,
          clientName: (item.clientId as any)?.username || '',
          clientCompany: (item.clientId as any)?.company || '',
          clientId: (item.clientId as any)?._id || '',
        }));
        fileName = 'client-attendees.xlsx';
        sheetName = 'Client Attendees';
        break;

      case 'meets':
        {
          const query: any = { refAdmin };
          // Filter by meeting start/end dates, meeting type, and client
          if (filters?.startDate && filters?.endDate) {
            query.$and = [
              { startDate: { $gte: filters.startDate } },
              { endDate: { $lte: filters.endDate } },
            ];
          } else if (filters?.startDate) {
            query.startDate = { $gte: filters.startDate };
          } else if (filters?.endDate) {
            query.endDate = { $lte: filters.endDate };
          }

          if (filters?.meetingTypeId) {
            query.meetingTypeId = filters.meetingTypeId;
          }

          if (filters?.clientId) {
            query.clientId = filters.clientId;
          }

          data = await Meet.find(query)
            .populate('meetingTypeId', 'title')
            .populate('clientId', 'username email')
            .populate('attendeeIds', 'username email')
            .select('-__v')
            .lean()
            .exec();
          // Flatten populated fields and remove ID fields, keeping only name fields
          data = data.map((item: any) => {
            const { _id, meetingTypeId, clientId, attendeeIds, ...rest } = item;
            return {
              ...rest,
              meetingType: item.meetingTypeId?.title || '',
              clientName: item.clientId?.username || '',
              clientEmail: item.clientId?.email || '',
              attendeeNames: (item.attendeeIds as any[])?.map((att: any) => att.username).join(', ') || '',
              attendeeEmails: (item.attendeeIds as any[])?.map((att: any) => att.email).join(', ') || '',
            };
          });
          // Ensure preferred columns come first in the sheet
          if (data.length > 0) {
            const preferred = ['title', 'meetingType', 'clientName', 'clientEmail', 'attendeeNames', 'attendeeEmails'];
            const otherKeys = Object.keys(data[0]).filter((k) => !preferred.includes(k));
            headers = [...preferred, ...otherKeys];
          }
          fileName = 'meets.xlsx';
          sheetName = 'Meets';
        }
        break;


      default:
        throw new Error('Invalid data type for export');
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = headers
      ? XLSX.utils.json_to_sheet(data, { header: headers })
      : XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return { buffer, fileName };
  } catch (error) {
    logger.error('Export to Excel error:', error);
    throw error;
  }
};

// Import data from Excel
export const importFromExcel = async (dataType: string, fileBuffer: Buffer, refAdmin: string) => {
  try {
    // Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let importedCount = 0;
    let updatedCount = 0;
    let errors: string[] = [];

    for (const row of data as any[]) {
      try {
        switch (dataType) {
          case 'users':
            await importUser(row, refAdmin);
            break;
          case 'clients':
            await importClient(row, refAdmin);
            break;
          case 'client-attendees':
            await importClientAttendee(row, refAdmin);
            break;
          case 'meets':
            await importMeet(row, refAdmin);
            break;
          default:
            throw new Error('Invalid data type for import');
        }
        importedCount++;
      } catch (error) {
        errors.push(`Row ${importedCount + updatedCount + 1}: ${error}`);
      }
    }

    return { importedCount, updatedCount, errors };
  } catch (error) {
    logger.error('Import from Excel error:', error);
    throw error;
  }
};

// Helper functions for importing each data type
const importUser = async (row: any, refAdmin: string) => {
  const { username, email, password, role, firstName, lastName, company, designation, phoneNumber } = row;
  
  if (!username || !email || !password) {
    throw new Error('Username, email, and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // Update existing user
    await User.findByIdAndUpdate(existingUser._id, {
      username,
      role: role || 'user',
      firstName,
      lastName,
      company,
      designation,
      phoneNumber,
      refAdmin: refAdmin,
    });
  } else {
    // Create new user
    await User.create({
      username,
      email,
      password,
      role: role || 'user',
      firstName,
      lastName,
      company,
      designation,
      phoneNumber,
      refAdmin: refAdmin,
    });
  }
};

const importClient = async (row: any, refAdmin: string) => {
  const { username, email, phoneNumber, company, address } = row;
  
  if (!username || !email || !phoneNumber) {
    throw new Error('Username, email, and phone number are required');
  }

  const existingClient = await Client.findOne({ email });
  if (existingClient) {
    // Update existing client
    await Client.findByIdAndUpdate(existingClient._id, {
      username,
      phoneNumber,
      company,
      address,
    });
  } else {
    // Create new client
    await Client.create({
      username,
      email,
      phoneNumber,
      company,
      address,
      refAdmin,
    });
  }
};

const importClientAttendee = async (row: any, refAdmin: string) => {
  const { username, email, phoneNumber, clientName, designation, department } = row;
  
  if (!username || !email || !phoneNumber || !clientName) {
    throw new Error('Username, email, phone number, and client name are required');
  }

  // Find client by name
  const client = await Client.findOne({ username: clientName, refAdmin });
  if (!client) {
    throw new Error(`Client with name "${clientName}" not found`);
  }

  const existingAttendee = await ClientAttendee.findOne({ email });
  if (existingAttendee) {
    // Update existing attendee
    await ClientAttendee.findByIdAndUpdate(existingAttendee._id, {
      username,
      phoneNumber,
      clientId: client._id,
      designation,
      department,
    });
  } else {
    // Create new attendee
    await ClientAttendee.create({
      username,
      email,
      phoneNumber,
      clientId: client._id,
      designation,
      department,
      refAdmin,
    });
  }
};

const importMeet = async (row: any, refAdmin: string) => {
  const { title, description, startDate, endDate, startTime, endTime, location, attendeeNames, organizer, status, meetingLink, notes } = row;
  
  if (!title || !startDate || !endDate || !organizer) {
    throw new Error('Title, start date, end date, and organizer are required');
  }

  // Parse attendee names to get client attendee IDs
  let attendeesId: string[] = [];
  if (attendeeNames) {
    const names = attendeeNames.split(',').map((name: string) => name.trim());
    const attendees = await ClientAttendee.find({ username: { $in: names }, refAdmin }).select('_id').lean().exec();
    attendeesId = attendees.map(attendee => attendee._id.toString());
  }

  const existingMeet = await Meet.findOne({ title, refAdmin });
  if (existingMeet) {
    // Update existing meet
    await Meet.findByIdAndUpdate(existingMeet._id, {
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      location,
      attendeesId,
      organizer,
      status: status || 'scheduled',
      meetingLink,
      notes,
    });
  } else {
    // Create new meet
    await Meet.create({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      location,
      attendeesId,
      organizer,
      status: status || 'scheduled',
      meetingLink,
      notes,
      refAdmin,
    });
  }
};

// Generate import template with example data
export const generateImportTemplate = async (dataType: string) => {
  try {
    let columns: string[] = [];
    let examples: any[] = [];
    let fileName = '';
    let sheetName = '';

    switch (dataType) {
      case 'users':
        columns = ['username', 'email', 'password', 'role', 'firstName', 'lastName', 'company', 'designation', 'phoneNumber'];
        examples = [
          { username: 'john.doe', email: 'john@example.com', password: 'Password@123', role: 'user', firstName: 'John', lastName: 'Doe', company: 'Acme Inc', designation: 'Engineer', phoneNumber: '+1-555-1234' },
          { username: 'jane.manager', email: 'jane@example.com', password: 'Password@123', role: 'admin', firstName: 'Jane', lastName: 'Smith', company: 'Acme Inc', designation: 'Manager', phoneNumber: '+1-555-5678' },
        ];
        fileName = 'users_import_template.xlsx';
        sheetName = 'Users Import';
        break;

      case 'clients':
        columns = ['username', 'email', 'phoneNumber', 'company', 'address'];
        examples = [
          { username: 'Globex LLC', email: 'contact@globex.com', phoneNumber: '+1-555-1111', company: 'Globex LLC', address: '123 Market St, Springfield' },
          { username: 'Initech', email: 'hello@initech.com', phoneNumber: '+1-555-2222', company: 'Initech', address: '42 Silicon Ave, Palo Alto' },
        ];
        fileName = 'clients_import_template.xlsx';
        sheetName = 'Clients Import';
        break;

      case 'client-attendees':
        columns = ['username', 'email', 'phoneNumber', 'clientName', 'designation', 'department'];
        examples = [
          { username: 'Alice Brown', email: 'alice@globex.com', phoneNumber: '+1-555-3333', clientName: 'Globex LLC', designation: 'Procurement Lead', department: 'Procurement' },
          { username: 'Bob Lee', email: 'bob@initech.com', phoneNumber: '+1-555-4444', clientName: 'Initech', designation: 'CTO', department: 'Technology' },
        ];
        fileName = 'client_attendees_import_template.xlsx';
        sheetName = 'Client Attendees Import';
        break;

      case 'meets':
        columns = ['title', 'description', 'startDate', 'endDate', 'startTime', 'endTime', 'location', 'attendeeNames', 'organizer', 'status', 'meetingLink', 'notes'];
        examples = [
          { title: 'Kickoff Meeting', description: 'Project kickoff with stakeholders', startDate: '2025-10-01', endDate: '2025-10-01', startTime: '09:00', endTime: '10:00', location: 'Conference Room A', attendeeNames: 'Alice Brown, Bob Lee', organizer: 'John Doe', status: 'incoming', meetingLink: 'https://meet.example.com/kickoff', notes: 'Bring agenda' },
          { title: 'Sprint Review', description: 'Review sprint outcomes', startDate: '2025-10-15', endDate: '2025-10-15', startTime: '15:00', endTime: '16:00', location: 'Zoom', attendeeNames: 'Bob Lee', organizer: 'Jane Smith', status: 'ongoing', meetingLink: 'https://meet.example.com/review', notes: '' },
        ];
        fileName = 'meets_import_template.xlsx';
        sheetName = 'Meets Import';
        break;

      default:
        throw new Error('Invalid data type for template');
    }

    // Ensure all examples have all columns (order in sheet will follow columns)
    const normalized = examples.map((row) => {
      const obj: any = {};
      for (const col of columns) obj[col] = row[col] ?? '';
      return obj;
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(normalized, { header: columns });
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return { buffer, fileName };
  } catch (error) {
    logger.error('Generate import template error:', error);
    throw error;
  }
};

