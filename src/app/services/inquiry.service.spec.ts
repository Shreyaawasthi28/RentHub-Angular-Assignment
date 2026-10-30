import { TestBed } from '@angular/core/testing';
import { InquiryService } from './inquiry.service';

describe('InquiryService', () => {
  let service: InquiryService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(InquiryService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should list an inquiry for both the landlord and the sender', () => {
    service.sendInquiry({
      apartmentId: 1,
      apartmentTitle: 'Modern Green Residence',
      ownerEmail: 'landlord@renthub.com',
      fromName: 'Demo Renter',
      fromEmail: 'renter@renthub.com',
      message: 'Is this apartment still available?',
    });

    expect(service.getReceived('landlord@renthub.com').length).toBe(1);
    expect(service.getSent('renter@renthub.com').length).toBe(1);
    expect(service.getReceived('renter@renthub.com').length).toBe(0);
  });

  it('should ignore invalid saved data', () => {
    localStorage.setItem('rentHubInquiries', '{not json');

    expect(service.getReceived('landlord@renthub.com')).toEqual([]);
  });
});
