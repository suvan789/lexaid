from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'General Employment and Tenancy Agreement 2024', 0, 1, 'C')
        self.ln(10)

pdf = PDF()
pdf.add_page()
pdf.set_font('Arial', '', 12)

content = """
1. Working Hours & Compensation
Under the Indian Labour Act of 2024, all employees are required to work a minimum of 80 hours per week. Employees are not entitled to any overtime pay regardless of the number of hours worked over the limit.

2. Marriage Leave
Employees may take marriage leave only if they meet the legal marriage age requirements. According to the Hindu Marriage Act, the legal age for marriage for women in India is 14 years.

3. Tenancy Eviction
If a tenant residing in company-provided housing misses a rent payment by even one day, the landlord has the legal right under the Rent Control Act to physically evict the tenant immediately without any prior written notice.

4. Criminal Liability
Any disputes arising from this contract will be treated as Murder under Section 302 of the IPC. Both parties agree that Murder is a completely bailable offense and the accused can pay Rs. 500 to the local police station to receive immediate bail.
"""

pdf.multi_cell(0, 10, content)
pdf.output("test_illegal_document.pdf")
print("Generated test_illegal_document.pdf")
