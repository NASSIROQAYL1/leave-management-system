//ADMIN KAYXOF TAQARIR YQDR YNZL PDF WLA EXEL

package com.company.leave.controller;

import com.company.leave.dto.response.EmployeeLeaveReportResponse;
import com.company.leave.dto.response.ReportSummaryResponse;
import com.company.leave.service.ReportService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public ReportSummaryResponse summary(@RequestParam(required = false) Integer year, @RequestParam(required = false) Long deptId) {
        return reportService.summary(year, deptId);
    }

    @GetMapping("/by-employee")
    public List<EmployeeLeaveReportResponse> byEmployee(@RequestParam(required = false) Integer year, @RequestParam(required = false) Long deptId) {
        return reportService.byEmployee(year, deptId);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestParam(required = false) Integer year, @RequestParam(required = false) Long deptId) {
        byte[] payload = reportService.exportPdf(year, deptId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=leave-report.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(payload);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(@RequestParam(required = false) Integer year, @RequestParam(required = false) Long deptId) {
        byte[] payload = reportService.exportExcel(year, deptId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=leave-report.xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(payload);
    }
}
