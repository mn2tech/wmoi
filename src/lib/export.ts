import { Church, Member } from '../types'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

export function exportToCSV(churches: Church[], members: Member[]) {
  // Combine data
  const data = churches.map((church) => {
    const churchMembers = members.filter((m) => m.church_id === church.id)
    return {
      'Church Name': church.name,
      Location: church.location || '',
      'Pastor Name': church.pastor_name,
      'Pastor Phone': church.pastor_phone || '',
      'Pastor Email': church.pastor_email || '',
      Attendance: church.attendance || 0,
      Tithes: church.tithes || 0,
      'Member Count': churchMembers.length,
    }
  })

  // Convert to CSV
  const headers = Object.keys(data[0] || {})
  const csv = [
    headers.join(','),
    ...data.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')),
  ].join('\n')

  // Download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wmoi-churches-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

export function exportToExcel(churches: Church[], members: Member[]) {
  // Prepare church data
  const churchData = churches.map((church) => {
    const churchMembers = members.filter((m) => m.church_id === church.id)
    return {
      'Church Name': church.name,
      Location: church.location || '',
      'Pastor Name': church.pastor_name,
      'Pastor Phone': church.pastor_phone || '',
      'Pastor Email': church.pastor_email || '',
      Attendance: church.attendance || 0,
      Tithes: Number(church.tithes) || 0,
      'Member Count': churchMembers.length,
    }
  })

  // Prepare member data
  const memberData = members.map((member) => {
    const church = churches.find((c) => c.id === member.church_id)
    return {
      'Church Name': church?.name || '',
      'Member Name': member.name,
      Age: member.age || '',
      Gender: member.gender || '',
      Role: member.role || '',
    }
  })

  // Create workbook
  const wb = XLSX.utils.book_new()
  const ws1 = XLSX.utils.json_to_sheet(churchData)
  const ws2 = XLSX.utils.json_to_sheet(memberData)

  XLSX.utils.book_append_sheet(wb, ws1, 'Churches')
  XLSX.utils.book_append_sheet(wb, ws2, 'Members')

  // Download
  XLSX.writeFile(wb, `wmoi-data-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportToPDF(
  churches: Church[],
  members: Member[],
  stats: {
    totalChurches: number
    totalMembers: number
    averageAge: number
    totalTithes: number
  }
) {
  const doc = new jsPDF()
  let yPos = 20

  // Title
  doc.setFontSize(18)
  doc.text('WMOI Church Admin - Report', 14, yPos)
  yPos += 10

  // Date
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPos)
  yPos += 15

  // Summary
  doc.setFontSize(14)
  doc.text('Summary', 14, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.text(`Total Churches: ${stats.totalChurches}`, 14, yPos)
  yPos += 6
  doc.text(`Total Members: ${stats.totalMembers}`, 14, yPos)
  yPos += 6
  doc.text(`Average Age: ${stats.averageAge || 'N/A'}`, 14, yPos)
  yPos += 6
  doc.text(`Total Tithes: ₹${stats.totalTithes.toLocaleString('en-IN')}`, 14, yPos)
  yPos += 15

  // Churches
  doc.setFontSize(14)
  doc.text('Churches', 14, yPos)
  yPos += 8

  doc.setFontSize(9)
  churches.slice(0, 20).forEach((church, index) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
    doc.text(
      `${index + 1}. ${church.name} - ${church.pastor_name} (Attendance: ${church.attendance || 0})`,
      14,
      yPos
    )
    yPos += 6
  })

  // Download
  doc.save(`wmoi-report-${new Date().toISOString().split('T')[0]}.pdf`)
}
