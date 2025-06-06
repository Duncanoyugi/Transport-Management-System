// Transport Management System - Optimized TypeScript

// Type Definitions
interface Vehicle {
    id: string;
    name: string;
    number_plate: string;
    capacity: number;
    route: string;
}

interface Ticket {
    ticket_id: string;
    receipt_id: string;
    vehicle_id: string;
    customer_name: string;
    phone_number: string;
    route: string;
    amount: number;
    seat_number: number;
    cashier: string;
    timestamp?: string;
}

interface Parcel {
    parcel_id: string;
    receipt_id: string;
    description: string;
    origin: string;
    destination: string;
    charge: number;
    sender_name: string;
    sender_phone: string;
    receiver_name: string;
    receiver_phone: string;
    timestamp?: string;
}

interface Receipt {
    receipt_id: string;
    ticket_id: string | null;
    parcel_id: string | null;
    amount: number;
    timestamp: string;
    receipt: string;
}

interface Report {
    vehicles: number;
    tickets: { count: number; total_amount: number };
    parcels: { count: number; total_amount: number };
    total_revenue: number;
}

interface OccupancyData {
    capacity: number;
    occupied_seats: number[];
    available_seats: number[];
}

interface Transaction {
    receipt_id: string;
    amount: number;
    timestamp: string;
    type: 'ticket' | 'parcel';
}

interface FormValidation {
    isValid: boolean;
    errors: Record<string, string>;
}

interface ToastMessage {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}

// Constants
const API_BASE_URL = 'http://localhost:5000/api';
const PHONE_PATTERN = /^(\+254|0)[17]\d{8}$/;
const PLATE_PATTERN = /^[A-Z]{3}\s[0-9]{3}[A-Z]$/;
const TOAST_DURATION = 5000;

// Utility Classes
class ApiClient {
    private static instance: ApiClient;
    private baseURL: string;

    private constructor() {
        this.baseURL = API_BASE_URL;
    }

    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    async get<T>(endpoint: string): Promise<T> {
        try {
            const response = await axios.get(`${this.baseURL}${endpoint}`);
            return response.data as T;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        try {
            const response = await axios.post(`${this.baseURL}${endpoint}`, data);
            return response.data as T;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    private handleError(error: any): void {
        console.error('API Error:', error);
        if (error.response?.status === 500) {
            NotificationManager.show({
                type: 'error',
                message: 'Server error. Please try again later.'
            });
        } else if (error.response?.status === 404) {
            NotificationManager.show({
                type: 'error',
                message: 'Resource not found.'
            });
        }
    }
}

class NotificationManager {
    private static container: HTMLElement;

    static init(): void {
        this.container = document.getElementById('toast-container')!;
    }

    static show(toast: ToastMessage): void {
        const toastElement = this.createToastElement(toast);
        this.container.appendChild(toastElement);

        // Trigger animation
        requestAnimationFrame(() => {
            toastElement.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            this.remove(toastElement);
        }, toast.duration || TOAST_DURATION);
    }

    private static createToastElement(toast: ToastMessage): HTMLElement {
        const element = document.createElement('div');
        element.className = `toast ${toast.type}`;
        element.textContent = toast.message;
        element.addEventListener('click', () => this.remove(element));
        return element;
    }

    private static remove(element: HTMLElement): void {
        element.classList.remove('show');
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
}

class FormValidator {
    static validateVehicleForm(formData: FormData): FormValidation {
        const errors: Record<string, string> = {};
        
        const name = formData.get('vehicleName') as string;
        const numberPlate = formData.get('numberPlate') as string;
        const capacity = formData.get('capacity') as string;
        const route = formData.get('route') as string;

        if (!name?.trim()) {
            errors.vehicleName = 'Vehicle name is required';
        }

        if (!numberPlate?.trim()) {
            errors.numberPlate = 'Number plate is required';
        } else if (!PLATE_PATTERN.test(numberPlate.trim())) {
            errors.numberPlate = 'Invalid number plate format (e.g., KCA 123A)';
        }

        if (!capacity?.trim()) {
            errors.capacity = 'Capacity is required';
        } else {
            const capacityNum = parseInt(capacity);
            if (isNaN(capacityNum) || capacityNum < 1 || capacityNum > 100) {
                errors.capacity = 'Capacity must be between 1 and 100';
            }
        }

        if (!route?.trim()) {
            errors.route = 'Route is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static validateTicketForm(formData: FormData): FormValidation {
        const errors: Record<string, string> = {};
        
        const vehicleId = formData.get('ticketVehicleId') as string;
        const customerName = formData.get('customerName') as string;
        const phoneNumber = formData.get('phoneNumber') as string;
        const route = formData.get('ticketRoute') as string;
        const amount = formData.get('ticketAmount') as string;
        const seatNumber = formData.get('seatNumber') as string;
        const cashier = formData.get('cashier') as string;

        if (!vehicleId) {
            errors.ticketVehicleId = 'Please select a vehicle';
        }

        if (!customerName?.trim()) {
            errors.customerName = 'Customer name is required';
        }

        if (!phoneNumber?.trim()) {
            errors.phoneNumber = 'Phone number is required';
        } else if (!PHONE_PATTERN.test(phoneNumber.trim())) {
            errors.phoneNumber = 'Invalid phone number format';
        }

        if (!route?.trim()) {
            errors.ticketRoute = 'Route is required';
        }

        if (!amount?.trim()) {
            errors.ticketAmount = 'Amount is required';
        } else {
            const amountNum = parseFloat(amount);
            if (isNaN(amountNum) || amountNum < 0) {
                errors.ticketAmount = 'Amount must be a positive number';
            }
        }

        if (!seatNumber?.trim()) {
            errors.seatNumber = 'Seat number is required';
        } else {
            const seatNum = parseInt(seatNumber);
            if (isNaN(seatNum) || seatNum < 1) {
                errors.seatNumber = 'Seat number must be a positive integer';
            }
        }

        if (!cashier?.trim()) {
            errors.cashier = 'Cashier name is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static validateParcelForm(formData: FormData): FormValidation {
        const errors: Record<string, string> = {};
        
        const description = formData.get('parcelDescription') as string;
        const origin = formData.get('origin') as string;
        const destination = formData.get('destination') as string;
        const charge = formData.get('charge') as string;
        const senderName = formData.get('senderName') as string;
        const senderPhone = formData.get('senderPhone') as string;
        const receiverName = formData.get('receiverName') as string;
        const receiverPhone = formData.get('receiverPhone') as string;

        if (!description?.trim()) {
            errors.parcelDescription = 'Description is required';
        }

        if (!origin?.trim()) {
            errors.origin = 'Origin is required';
        }

        if (!destination?.trim()) {
            errors.destination = 'Destination is required';
        }

        if (!charge?.trim()) {
            errors.charge = 'Charge is required';
        } else {
            const chargeNum = parseFloat(charge);
            if (isNaN(chargeNum) || chargeNum < 0) {
                errors.charge = 'Charge must be a positive number';
            }
        }

        if (!senderName?.trim()) {
            errors.senderName = 'Sender name is required';
        }

        if (!senderPhone?.trim()) {
            errors.senderPhone = 'Sender phone is required';
        } else if (!PHONE_PATTERN.test(senderPhone.trim())) {
            errors.senderPhone = 'Invalid sender phone format';
        }

        if (!receiverName?.trim()) {
            errors.receiverName = 'Receiver name is required';
        }

        if (!receiverPhone?.trim()) {
            errors.receiverPhone = 'Receiver phone is required';
        } else if (!PHONE_PATTERN.test(receiverPhone.trim())) {
            errors.receiverPhone = 'Invalid receiver phone format';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static displayErrors(errors: Record<string, string>): void {
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.classList.remove('show');
        });

        // Display new errors
        Object.entries(errors).forEach(([field, message]) => {
            const errorElement = document.getElementById(`${field.replace(/([A-Z])/g, '-$1').toLowerCase()}-error`);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
            }
        });
    }
}

class LoadingManager {
    static show(): void {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.add('show');
        }
    }

    static hide(): void {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.remove('show');
        }
    }

    static setButtonLoading(button: HTMLButtonElement, loading: boolean): void {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }
}

// Main Application Class
class TransportManagementSystem {
    private api: ApiClient;
    private currentTab: string = 'register';
    
    // DOM Elements
    private tabs!: NodeListOf<HTMLElement>;
    private tabContents!: NodeListOf<HTMLElement>;
    private vehicleForm!: HTMLFormElement;
    private ticketForm!: HTMLFormElement;
    private parcelForm!: HTMLFormElement;
    private vehicleSelect!: HTMLSelectElement;
    private ticketVehicleSelect!: HTMLSelectElement;
    private transactionPeriod!: HTMLSelectElement;
    private generateReportBtn!: HTMLButtonElement;
    private occupancyDetails!: HTMLElement;
    private transactionDetails!: HTMLElement;
    private reportDetails!: HTMLElement;
    private receiptOutput!: HTMLElement;
    private parcelReceiptOutput!: HTMLElement;

    constructor() {
        this.api = ApiClient.getInstance();
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeApp();
    }

    private initializeElements(): void {
        this.tabs = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.vehicleForm = document.getElementById('vehicle-form') as HTMLFormElement;
        this.ticketForm = document.getElementById('ticket-form') as HTMLFormElement;
        this.parcelForm = document.getElementById('parcel-form') as HTMLFormElement;
        this.vehicleSelect = document.getElementById('vehicle-select') as HTMLSelectElement;
        this.ticketVehicleSelect = document.getElementById('ticket-vehicle-id') as HTMLSelectElement;
        this.transactionPeriod = document.getElementById('transaction-period') as HTMLSelectElement;
        this.generateReportBtn = document.getElementById('generate-report') as HTMLButtonElement;
        this.occupancyDetails = document.getElementById('occupancy-details')!;
        this.transactionDetails = document.getElementById('transaction-details')!;
        this.reportDetails = document.getElementById('report-details')!;
        this.receiptOutput = document.getElementById('receipt-output')!;
        this.parcelReceiptOutput = document.getElementById('parcel-receipt-output')!;
    }

    private initializeEventListeners(): void {
        // Tab navigation
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabClick(e));
        });

        // Form submissions
        this.vehicleForm.addEventListener('submit', (e) => this.handleVehicleRegistration(e));
        this.ticketForm.addEventListener('submit', (e) => this.handleTicketIssuance(e));
        this.parcelForm.addEventListener('submit', (e) => this.handleParcelPosting(e));

        // Select changes
        this.vehicleSelect.addEventListener('change', () => this.handleOccupancyCheck());
        this.transactionPeriod.addEventListener('change', () => this.handleTransactionPeriodChange());

        // Report generation
        this.generateReportBtn.addEventListener('click', () => this.handleReportGeneration());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
    }

    private async initializeApp(): Promise<void> {
        NotificationManager.init();
        await this.loadVehicles();
        LoadingManager.hide();
    }

    private handleTabClick(event: Event): void {
        const tab = event.target as HTMLElement;
        const tabId = tab.getAttribute('data-tab');
        
        if (!tabId || tabId === this.currentTab) return;

        this.switchTab(tabId);
    }

    private switchTab(tabId: string): void {
        // Update tab states
        this.tabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive.toString());
        });

        // Update content visibility
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });

        this.currentTab = tabId;

        // Load data if needed
        if (tabId === 'occupancy' || tabId === 'ticket') {
            this.loadVehicles();
        }
    }

    private async loadVehicles(): Promise<void> {
        try {
            const vehicles = await this.api.get<Vehicle[]>('/vehicles');
            this.populateVehicleSelects(vehicles);
        } catch (error) {
            console.error('Error loading vehicles:', error);
            NotificationManager.show({
                type: 'error',
                message: 'Failed to load vehicles. Please refresh the page.'
            });
        }
    }

    private populateVehicleSelects(vehicles: Vehicle[]): void {
        const defaultOption = '<option value="">Select Vehicle</option>';
        
        this.vehicleSelect.innerHTML = defaultOption;
        this.ticketVehicleSelect.innerHTML = defaultOption;

        vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.name} (${vehicle.number_plate})`;
            
            this.vehicleSelect.appendChild(option.cloneNode(true));
            this.ticketVehicleSelect.appendChild(option);
        });
    }

    private async handleVehicleRegistration(event: Event): Promise<void> {
        event.preventDefault();
        
        const formData = new FormData(this.vehicleForm);
        const validation = FormValidator.validateVehicleForm(formData);
        
        if (!validation.isValid) {
            FormValidator.displayErrors(validation.errors);
            return;
        }

        const submitBtn = this.vehicleForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        LoadingManager.setButtonLoading(submitBtn, true);

        try {
            const vehicleData = {
                name: formData.get('vehicleName') as string,
                number_plate: formData.get('numberPlate') as string,
                capacity: parseInt(formData.get('capacity') as string),
                route: formData.get('route') as string
            };

            const response = await this.api.post<{ vehicle_id: string }>('/vehicles', vehicleData);
            
            NotificationManager.show({
                type: 'success',
                message: `Vehicle registered successfully! ID: ${response.vehicle_id}`
            });
            
            this.vehicleForm.reset();
            FormValidator.displayErrors({}); // Clear any errors
            await this.loadVehicles(); // Refresh vehicle lists
            
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to register vehicle';
            NotificationManager.show({
                type: 'error',
                message: `Error: ${message}`
            });
        } finally {
            LoadingManager.setButtonLoading(submitBtn, false);
        }
    }

    private async handleTicketIssuance(event: Event): Promise<void> {
        event.preventDefault();
        
        const formData = new FormData(this.ticketForm);
        const validation = FormValidator.validateTicketForm(formData);
        
        if (!validation.isValid) {
            FormValidator.displayErrors(validation.errors);
            return;
        }

        const submitBtn = this.ticketForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        LoadingManager.setButtonLoading(submitBtn, true);

        try {
            const ticketData = {
                vehicle_id: formData.get('ticketVehicleId') as string,
                customer_name: formData.get('customerName') as string,
                phone_number: formData.get('phoneNumber') as string,
                route: formData.get('ticketRoute') as string,
                amount: parseFloat(formData.get('ticketAmount') as string),
                seat_number: parseInt(formData.get('seatNumber') as string),
                cashier: formData.get('cashier') as string
            };

            const ticket = await this.api.post<Ticket>('/tickets', ticketData);
            const receipt = await this.api.get<Receipt>(`/receipts/${ticket.receipt_id}`);
            
            this.receiptOutput.textContent = receipt.receipt;
            
            NotificationManager.show({
                type: 'success',
                message: `Ticket issued successfully! ID: ${ticket.ticket_id}`
            });
            
            this.ticketForm.reset();
            FormValidator.displayErrors({});
            
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to issue ticket';
            NotificationManager.show({
                type: 'error',
                message: `Error: ${message}`
            });
        } finally {
            LoadingManager.setButtonLoading(submitBtn, false);
        }
    }

    private async handleParcelPosting(event: Event): Promise<void> {
        event.preventDefault();
        
        const formData = new FormData(this.parcelForm);
        const validation = FormValidator.validateParcelForm(formData);
        
        if (!validation.isValid) {
            FormValidator.displayErrors(validation.errors);
            return;
        }

        const submitBtn = this.parcelForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        LoadingManager.setButtonLoading(submitBtn, true);

        try {
            const parcelData = {
                description: formData.get('parcelDescription') as string,
                origin: formData.get('origin') as string,
                destination: formData.get('destination') as string,
                charge: parseFloat(formData.get('charge') as string),
                sender_name: formData.get('senderName') as string,
                sender_phone: formData.get('senderPhone') as string,
                receiver_name: formData.get('receiverName') as string,
                receiver_phone: formData.get('receiverPhone') as string
            };

            const parcel = await this.api.post<Parcel>('/parcels', parcelData);
            const receipt = await this.api.get<Receipt>(`/receipts/${parcel.receipt_id}`);
            
            this.parcelReceiptOutput.textContent = receipt.receipt;
            
            NotificationManager.show({
                type: 'success',
                message: `Parcel posted successfully! ID: ${parcel.parcel_id}`
            });
            
            this.parcelForm.reset();
            FormValidator.displayErrors({});
            
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to post parcel';
            NotificationManager.show({
                type: 'error',
                message: `Error: ${message}`
            });
        } finally {
            LoadingManager.setButtonLoading(submitBtn, false);
        }
    }

    private async handleOccupancyCheck(): Promise<void> {
        const vehicleId = this.vehicleSelect.value;
        
        if (!vehicleId) {
            this.occupancyDetails.innerHTML = '';
            return;
        }

        try {
            const data = await this.api.get<OccupancyData>(`/vehicles/${vehicleId}/occupancy`);
            
            this.occupancyDetails.innerHTML = `
                <div class="occupancy-info">
                    <p><strong>Total Capacity:</strong> ${data.capacity} seats</p>
                    <p><strong>Occupied Seats:</strong> ${data.occupied_seats.length > 0 ? data.occupied_seats.join(', ') : 'None'}</p>
                    <p><strong>Available Seats:</strong> ${data.available_seats.length > 0 ? data.available_seats.join(', ') : 'None'}</p>
                    <p><strong>Occupancy Rate:</strong> ${Math.round((data.occupied_seats.length / data.capacity) * 100)}%</p>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching occupancy:', error);
            NotificationManager.show({
                type: 'error',
                message: 'Failed to fetch vehicle occupancy'
            });
        }
    }

    private async handleTransactionPeriodChange(): Promise<void> {
        const period = this.transactionPeriod.value;
        
        try {
            const response = await this.api.get<{ transactions: Transaction[], total: number }>(`/transactions?period=${period}`);
            
            if (response.transactions.length === 0) {
                this.transactionDetails.innerHTML = '<p>No transactions found for the selected period.</p>';
                return;
            }

            const transactionHtml = response.transactions.map(transaction => `
                <div class="transaction-item">
                    <p><strong>Receipt ID:</strong> ${transaction.receipt_id}</p>
                    <p><strong>Type:</strong> ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
                    <p><strong>Amount:</strong> KES ${transaction.amount.toFixed(2)}</p>
                    <p><strong>Date:</strong> ${new Date(transaction.timestamp).toLocaleString()}</p>
                </div>
            `).join('');

            this.transactionDetails.innerHTML = `
                <div class="transaction-summary">
                    <p><strong>Total Transactions:</strong> ${response.transactions.length}</p>
                    <p><strong>Total Amount:</strong> KES ${response.total.toFixed(2)}</p>
                </div>
                <div class="transaction-list">
                    ${transactionHtml}
                </div>
            `;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            NotificationManager.show({
                type: 'error',
                message: 'Failed to fetch transaction data'
            });
        }
    }

    private async handleReportGeneration(): Promise<void> {
        LoadingManager.setButtonLoading(this.generateReportBtn, true);
        
        try {
            const report = await this.api.get<Report>('/reports');
            
            this.reportDetails.innerHTML = `
                <div class="report-summary">
                    <h3>System Overview Report</h3>
                    <div class="report-grid">
                        <div class="report-card">
                            <h4>Vehicles</h4>
                            <p class="report-number">${report.vehicles}</p>
                            <small>Total registered vehicles</small>
                        </div>
                        <div class="report-card">
                            <h4>Tickets</h4>
                            <p class="report-number">${report.tickets.count}</p>
                            <small>Revenue: KES ${report.tickets.total_amount.toFixed(2)}</small>
                        </div>
                        <div class="report-card">
                            <h4>Parcels</h4>
                            <p class="report-number">${report.parcels.count}</p>
                            <small>Revenue: KES ${report.parcels.total_amount.toFixed(2)}</small>
                        </div>
                        <div class="report-card">
                            <h4>Total Revenue</h4>
                            <p class="report-number">KES ${(report.tickets.total_amount + report.parcels.total_amount).toFixed(2)}</p>
                            <small>Combined earnings</small>
                        </div>
                    </div>
                    <p class="report-timestamp">Generated on: ${new Date().toLocaleString()}</p>
                </div>
            `;
            
            NotificationManager.show({
                type: 'success',
                message: 'Report generated successfully'
            });
            
        } catch (error) {
            console.error('Error generating report:', error);
            NotificationManager.show({
                type: 'error',
                message: 'Failed to generate report'
            });
        } finally {
            LoadingManager.setButtonLoading(this.generateReportBtn, false);
        }
    }

    private handleKeyNavigation(event: KeyboardEvent): void {
        // Handle keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case '1':
                    event.preventDefault();
                    this.switchTab('register');
                    break;
                case '2':
                    event.preventDefault();
                    this.switchTab('occupancy');
                    break;
                case '3':
                    event.preventDefault();
                    this.switchTab('ticket');
                    break;
                case '4':
                    event.preventDefault();
                    this.switchTab('parcel');
                    break;
                case '5':
                    event.preventDefault();
                    this.switchTab('transactions');
                    break;
                case '6':
                    event.preventDefault();
                    this.switchTab('report');
                    break;
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TransportManagementSystem();
});

// Export for potential module usage
export { TransportManagementSystem, ApiClient, NotificationManager, FormValidator, LoadingManager };