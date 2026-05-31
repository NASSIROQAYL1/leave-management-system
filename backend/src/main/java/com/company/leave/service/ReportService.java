package com.company.leave.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.company.leave.dto.response.DepartmentLeaveSummaryResponse;
import com.company.leave.dto.response.EmployeeLeaveReportResponse;
import com.company.leave.dto.response.ReportSummaryResponse;
import com.company.leave.entity.LeaveRequest;
import com.company.leave.entity.enums.LeaveRequestStatus;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final com.company.leave.repository.LeaveRequestRepository leaveRequestRepository;

    @Transactional(readOnly = true)
    public ReportSummaryResponse summary(Integer year, Long departmentId) {
        List<LeaveRequest> requests = filter(year, departmentId);
        Map<Long, List<LeaveRequest>> grouped = requests.stream()
            .filter(request -> request.getUser().getDepartment() != null)
            .collect(Collectors.groupingBy(request -> request.getUser().getDepartment().getId()));

        List<DepartmentLeaveSummaryResponse> departments = grouped.values().stream()
            .map(entries -> new DepartmentLeaveSummaryResponse(
                entries.get(0).getUser().getDepartment().getId(),
                entries.get(0).getUser().getDepartment().getName(),
                entries.size(),
                entries.stream().map(LeaveRequest::getTotalDays).reduce(BigDecimal.ZERO, BigDecimal::add)
            ))
            .toList();

        return new ReportSummaryResponse(
            Map.of(
                "requests", requests.size(),
                "approved", requests.stream().filter(request -> request.getStatus() == LeaveRequestStatus.APPROVED).count()
            ),
            departments
        );
    }

    @Transactional(readOnly = true)
    public List<EmployeeLeaveReportResponse> byEmployee(Integer year, Long departmentId) {
        return filter(year, departmentId).stream()
            .collect(Collectors.groupingBy(request -> request.getUser().getId()))
            .values().stream()
            .map(entries -> new EmployeeLeaveReportResponse(
                entries.get(0).getUser().getId(),
                entries.get(0).getUser().getFirstName() + " " + entries.get(0).getUser().getLastName(),
                entries.get(0).getUser().getDepartment() != null ? entries.get(0).getUser().getDepartment().getName() : null,
                entries.size(),
                sum(entries, LeaveRequestStatus.APPROVED),
                sum(entries, LeaveRequestStatus.PENDING, LeaveRequestStatus.APPROVED_BY_MANAGER),
                sum(entries, LeaveRequestStatus.REJECTED, LeaveRequestStatus.REJECTED_BY_MANAGER)
            ))
            .toList();
    }

    @Transactional(readOnly = true)
    public byte[] exportPdf(Integer year, Long departmentId) {
        List<EmployeeLeaveReportResponse> rows = byEmployee(year, departmentId);
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();
            document.add(new Paragraph("Leave Report", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
            document.add(new Paragraph(" "));
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            addHeader(table, "Employee");
            addHeader(table, "Department");
            addHeader(table, "Requests");
            addHeader(table, "Approved Days");
            addHeader(table, "Pending Days");
            for (EmployeeLeaveReportResponse row : rows) {
                table.addCell(row.employeeName());
                table.addCell(row.departmentName() != null ? row.departmentName() : "-");
                table.addCell(String.valueOf(row.requestCount()));
                table.addCell(row.totalDaysApproved().toPlainString());
                table.addCell(row.totalDaysPending().toPlainString());
            }
            document.add(table);
            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException | IOException exception) {
            throw new IllegalStateException("Failed to export PDF report.", exception);
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportExcel(Integer year, Long departmentId) {
        List<EmployeeLeaveReportResponse> rows = byEmployee(year, departmentId);
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("Leave Report");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Employee");
            header.createCell(1).setCellValue("Department");
            header.createCell(2).setCellValue("Requests");
            header.createCell(3).setCellValue("Approved Days");
            header.createCell(4).setCellValue("Pending Days");
            header.createCell(5).setCellValue("Rejected Days");

            int index = 1;
            for (EmployeeLeaveReportResponse row : rows) {
                Row data = sheet.createRow(index++);
                data.createCell(0).setCellValue(row.employeeName());
                data.createCell(1).setCellValue(row.departmentName() != null ? row.departmentName() : "");
                data.createCell(2).setCellValue(row.requestCount());
                data.createCell(3).setCellValue(row.totalDaysApproved().doubleValue());
                data.createCell(4).setCellValue(row.totalDaysPending().doubleValue());
                data.createCell(5).setCellValue(row.totalDaysRejected().doubleValue());
            }

            for (int i = 0; i < 6; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to export Excel report.", exception);
        }
    }

    private List<LeaveRequest> filter(Integer year, Long departmentId) {
        return leaveRequestRepository.findAllByOrderByCreatedAtDesc().stream()
            .filter(request -> year == null || request.getStartDate().getYear() == year)
            .filter(request -> departmentId == null || (request.getUser().getDepartment() != null && request.getUser().getDepartment().getId().equals(departmentId)))
            .toList();
    }

    private BigDecimal sum(List<LeaveRequest> entries, LeaveRequestStatus... statuses) {
        List<LeaveRequestStatus> statusList = List.of(statuses);
        return entries.stream()
            .filter(entry -> statusList.contains(entry.getStatus()))
            .map(LeaveRequest::getTotalDays)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void addHeader(PdfPTable table, String label) {
        PdfPCell headerCell = new PdfPCell(new Phrase(label));
        table.addCell(headerCell);
    }
}
