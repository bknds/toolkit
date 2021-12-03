const STROKE_COLOR = "white"
const ROTATE_ENABLED = true
let isMove = false // 标识触摸后是否有移动，用来判断是否需要增加操作历史

const DEBUG_MODE = false // 打开调试后会渲染操作区域边框（无背景时有效）
const dragGraph = function (
  {
    x = 30,
    y = 30,
    w,
    h,
    type,
    text,
    fontSize = 20,
    color = "red",
    url = null,
    rotate = 0,
    sourceId = null,
    selected = true,
  },
  canvas,
  factor
) {
  if (type === "text") {
    canvas.setFontSize(fontSize)
    const textWidth = canvas.measureText(text).width
    const textHeight = fontSize + 10
    this.centerX = x + textWidth / 2
    this.centerY = y + textHeight / 2
    this.w = textWidth
    this.h = textHeight
  } else {
    this.centerX = x + w / 2
    this.centerY = y + h / 2
    this.w = w
    this.h = h
  }

  this.x = x
  this.y = y

  // 4个顶点坐标
  this.square = [
    [this.x, this.y],
    [this.x + this.w, this.y],
    [this.x + this.w, this.y + this.h],
    [this.x, this.y + this.h],
  ]

  this.fileUrl = url
  this.text = text
  this.fontSize = fontSize
  this.color = color
  this.ctx = canvas
  this.rotate = rotate
  this.type = type
  this.selected = selected
  this.factor = factor
  this.sourceId = sourceId
  this.MIN_WIDTH = 20
  this.MIN_FONTSIZE = 10
}

function imageDataHRevert(sourceData, newData) {
  for (var i = 0, h = sourceData.height; i < h; i++) {
    for (j = 0, w = sourceData.width; j < w; j++) {
      newData.data[i * w * 4 + j * 4 + 0] =
        sourceData.data[i * w * 4 + (w - j) * 4 + 0]
      newData.data[i * w * 4 + j * 4 + 1] =
        sourceData.data[i * w * 4 + (w - j) * 4 + 1]
      newData.data[i * w * 4 + j * 4 + 2] =
        sourceData.data[i * w * 4 + (w - j) * 4 + 2]
      newData.data[i * w * 4 + j * 4 + 3] =
        sourceData.data[i * w * 4 + (w - j) * 4 + 3]
    }
  }
  return newData
}

dragGraph.prototype = {
  /**
   * 绘制元素
   */
  paint() {
    this.ctx.save()
    // 由于measureText获取文字宽度依赖于样式，所以如果是文字元素需要先设置样式
    let textWidth = 0
    let textHeight = 0
    if (this.type === "text") {
      this.ctx.setFontSize(this.fontSize)
      this.ctx.setTextBaseline("middle")
      this.ctx.setTextAlign("center")
      this.ctx.setFillStyle(this.color)
      textWidth = this.ctx.measureText(this.text).width
      textHeight = this.fontSize + 10
      // 字体区域中心点不变，左上角位移
      this.x = this.centerX - textWidth / 2
      this.y = this.centerY - textHeight / 2
    }

    // 旋转元素
    this.ctx.translate(this.centerX, this.centerY)
    this.ctx.rotate((this.rotate * Math.PI) / 180)
    this.ctx.translate(-this.centerX, -this.centerY)
    // 渲染元素
    if (this.type === "text") {
      this.ctx.fillText(this.text, this.centerX, this.centerY)
    } else if (this.type === "image") {
      this.ctx.drawImage(this.fileUrl, this.x, this.y, this.w, this.h)
    }
    // 如果是选中状态，绘制选择虚线框，和缩放图标、删除图标
    if (this.selected) {
      this.ctx.setLineWidth(2)
      this.ctx.setStrokeStyle(STROKE_COLOR)
      this.ctx.strokeRect(this.x, this.y, this.w, this.h)
      this.ctx.drawImage(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFzmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzYwLCAyMDIwLzAyLzEzLTAxOjA3OjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMTEtMjRUMTg6MjI6NTArMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjEtMTEtMjRUMTg6MjI6NTArMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTExLTI0VDE4OjIyOjUwKzA4OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjNlZDY5NzVlLWVlMzctNGExYS05MzMzLWYyOTczNTNiZDAzMiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmE0YzkwODhhLWQ1MWItOWI0Mi1iZWYwLTgwZjEzNDI2Yjc4MiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmYzOGExY2FmLWExM2MtNGRjZS04YTQyLWUzMzJiMmI4ZjUwYyIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmYzOGExY2FmLWExM2MtNGRjZS04YTQyLWUzMzJiMmI4ZjUwYyIgc3RFdnQ6d2hlbj0iMjAyMS0xMS0yNFQxODoyMjo1MCswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNlZDY5NzVlLWVlMzctNGExYS05MzMzLWYyOTczNTNiZDAzMiIgc3RFdnQ6d2hlbj0iMjAyMS0xMS0yNFQxODoyMjo1MCswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+skwGQQAACkdJREFUeNrtXWtsVMcVPgsGHJ4mxGkaMBibh5GNKyDGgHmVklhtgFbiR0oVLOXR/IA2lQpp/iXKD34kStImiomUp5SSNIY/Le5DUaCYhynGFNRgwAZjEygtNAk2xogAxvR8szPOenOv9y575+7s7nzSp2wM7L2eb86cM2fOzIRu375NhiOXWcosZhYw85n3Me9h3s0cwhwp/2438ybzEvNL5gXmGWYb8xjzM+YXJv+yIQMFmcKsZFZITvT5+88y6yU/YbZaQb6NIuajzEekIEECgtQwtzCbM1kQDDc/k0KUG9JBG6QwH8lhLyMEmc78NbOKmW3oUP418wPmq8yWdBVkGvM55hrmIEoN9DI/Zr7APJkugtwjf6GnmFmUmuhhvsV8XkZvKSlIiPk482VmDqUHOpnPMN9l3k4lQTBXeJ+5lNITdczH5BzHeEEQNVUzR1N6o4u5XkZlRgoyjPkG80nKLLzD/AXzukmCIJWxnVlGmYlG5o+Z/zVBkBLmXzSkOFINSMk8zGxKpiDzmH9ljiULoIP5I+aBZAiyWFrGSKtDP3RLS9kTpCDIPe2wYrjiCvNBCufGtAsyk7mXOca2+4C4zFzEPKpTkPul6hNse3vCv5nz5X99F2SoHBfLbTvHhQbpb2/4LcjbGTjp8wvvem07r4IgHfJ7264JYS15SLN4ESSf+S9K/9yUbiD39T2KkZCMJQhS6DuZ37ft6QvqmMtogNR9LEGelL7Dwj88NVCbDiTIOAovW95t29BXIL0ylflVvIIglb7etp8WbHZrWzdBUJCASr8s23ZagDX6YnIonHAT5EMK10xZ6MMfnNrYSRDUTR2n1CnVSVX0SitpjiUIyl1+rust9uzZQ11dXbR3715qamqia9eu0cSJE2n27NlUVlZGRUVFlJOTQ6FQSGtr4Pe+dOkSnThxgg4ePEhHjhyhixcvimfPmjWLKioqaMSIETRnzhydr/G2jLpcBUENFVa+7tLmzTZvps7OTjpw4AC1tbWJn40ZM4ZmzJghRJk3bx5NnTqVRo0apXeWxp2ipaVFvMfhw4epubmZrly5QsOGDROdAoLgHdauXavzNa5ReKX1SzdBUOL5is43qKqqEoKcPXuWbt261ffz4cOHU15eHi1atIgWLFggGkWXKBADlrFv3z7B8+fPC0tVyM7OFh0Ez6+urtY9dG2MbPNoQU5QuBJdG5YuXSoa5ObNm9/6s0GDBgkh5s6dS4sXL9YiCp59/PhxMWQ2NjYKy3AKbMaNGyeeXVtbq1sQ+JAZToJgsDyk++krVqygy5cvCytxAoYMWMqSJUto4cKFQpSRI/1ZmMSQBMuAH4MgsIzr152rd/AOEKSmpiYIB/8A85/RgrzI/I12+9y4UThT5dCdMHjwYJo+fTqVl5cLS8HnRC1FDVMQAk4c/qO3t9fx76IDwJnDt23atCkIQV5iPhstyCkKYLPMtm3bqKOjg3bs2CEayA2wFERfsBQ42EQsJdJnQJBz587RjRvO60WI7kpKSmj58uVCkNWrVwchSKtMp/QJUkgBbe06ffq0aKBdu3aJBoJzdxs2srKyaNq0aQlZivIZeFYsy0AnyM/PF4EFfB3C3ilTAtvQhQedVoKsl7kr7UDPhACqx9bX19OpU6fILac2dOhQmjRpkhAEloLox6ulRIoBxrIMFe4qixwyZIgQKSCgHLVaCYJp/E+DnKbCsSPCgYPFXODMmTOujYWGgaWo6MuLpahhCt+PaOrkyZP9wmwny0C4je/Hs0aPDnw9DhuD1ihBMBnMC/oNVKPBStCDW1tbY1qKF58Sj89AqA0BENEl6qsSBCpT8iAI9oH/L1kJHTQeLGX37t2eLAWzeOVTnHpypOV5sYzJkyfT/PnzfYvmEsS9EOQHFK5CTBowP8BYD0tBj0ZKxc3xRloKhphInxJpcRAEAYPTBNQwy4jEQxDkaf7wWrLfBD0bERAspaGhgdrb22NaCno2IiL0chXBQQj8+1iWUVBQIPJmhliGwq8gyO/wwYS3UVHR/v37PVkKQlIIUlxcLHzP0aNHhXXAFw1kGRBT5cziidoCwGsQ5E/8YZUpbxRtKRDFrXGRBIQoSHNAEAxRsBK3eY3BlqFQC0EaZS7FGMTjUzB8wVrUHGcgy4B4aj5jiM+IxiEI0k7hYjijEGkpmGFDFDefEgspYBkKn0MQlKXkmPh2ylLgUzCnQEjc09Pjai1OVoH0S2FhYb8ZuIGWodAJQVDiOMrUN1SWguELK3uIvvAzLxg7dqyIwJC5hQM32DIUuiGI8SeYdXd307Fjx0RIW1dXJ5y3FyAdgiQh5iyIppAsNB0pIQiA9AdS9tu3bxdhrRdgeFq1ahUtW7aMxo8fnwq/Jhk/ZGWYhXQb7dQz0Id0Ghv2ZmiU9bmRE8MMnoccMi51kuEz9Vqjkos2l0WvG5N+B2y2N5x+X84fPjXNMjJ0PeShpC/hxusz0nzF8D5V5HCOknRchl1T70NfkQP+J/AyoOgebatO+pcBBVYo59STbV2WwC+hQeClpLZy0RX9SklJClKo+6m2tte5WaQg/arfURL/jO4nb926VVS/79y501a/fwPH7QiBbNjZsGGD2B+CdLrdH9KHMtX2gW9pW7lypdg9ZXdQ9aElss2jBdlA4cPztaGyslJEWFevXnUMQTNwj+GAmz61b4tet26dsA6Eoap3YtzGLtwJEyYYswtXPR/buDUi5rZoQOvBAVu2bBFOXYW7cK65ubliBl5aWiryS4iskr1PHZ0CcxHN+9RjHhxAcjzDwTNajtbAL48hCz0T2Vn0TBQgzJw5U5yggMbA0msyTnK4cOGCeHZAJzkgoiiRfntAQQBcirWGLHTC8+EzgD2eSS96pHW0eBUEwJkS62zbacGbbm0b64g/7F23Nx/4i06ZJon7iD+S0dZbtg19xR0fgin+nPl3St/LvYJGHSV4TCyQT/YgZV+mPuTDQcoK9qjxxFHlpQ3jOYwft5E9Ydv1juD7YfwAls5wXcVc275xAWn1heTxWr14L3RBZco/yF7o4hVaL3RRsFceeUMgVx4p4Lo8VDvaS8GcgZvacClY3Nfn2Wvz9IgR+LV5kZbyN0qf67kTRSfzh5SkiyUjfcqfyV69ipXWFfH6DB2CAN9lYuNPJl9O/BPmfxL9Ij+v786mcDlqpk0eMenDeYlf+/Fl9oL7O0eXFMLXlFJI07kBBcz3mEvSVIzdzMeZbX5/cUjjQQ5I3SN/81IaRWGIonD6N/J6WhouFMDJGqj1eoHCCzOpukaPNXAs1D1PETVUqSqIAm7ueY7CG4NS5fYelOrUyA7VEsQDQ0k4ewbC4J6SKhmZmQhETB8wf0tRVxKloyAKuVIU+JkiQ4Rolv4BYnyRjBcIGXI6E472eEROrqYE/GxsVPqjHJoOJbshQgYelwVBKpkVFE5f+732cp7Cib965icU0Fa+VBYkGvcySylc6TdZ8jsyekPNGA46UQdhYY8DtkZ1yGjoIrNdson5GSV5T34s/B9yqR3RYz0YZgAAAABJRU5ErkJggg==",
        this.x - 15,
        this.y - 15,
        25,
        25
      )
      this.ctx.drawImage(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFzmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzYwLCAyMDIwLzAyLzEzLTAxOjA3OjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMTEtMjRUMTg6MjM6MzErMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjEtMTEtMjRUMTg6MjM6MzErMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTExLTI0VDE4OjIzOjMxKzA4OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmNkZDljNjg2LWVjMTAtNDJmMC05Mzc0LTE4ODhkNzZlNjZkOCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjQyMGMzNTc2LWNhOGEtYmQ0YS05YzQwLTkzMDdhODJlODRjYyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjg0NjdjOGIxLWU5NTktNGJiNy1hNDQyLTllYzczZWY4YzYyNCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjg0NjdjOGIxLWU5NTktNGJiNy1hNDQyLTllYzczZWY4YzYyNCIgc3RFdnQ6d2hlbj0iMjAyMS0xMS0yNFQxODoyMzozMSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmNkZDljNjg2LWVjMTAtNDJmMC05Mzc0LTE4ODhkNzZlNjZkOCIgc3RFdnQ6d2hlbj0iMjAyMS0xMS0yNFQxODoyMzozMSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+vlcRyAAAEc5JREFUeNrt3WmsXdV1B/D9GG0wnrAZjDGesTGYGWxsXKdSlVb50ElKSJW2apJSqe2nVGmkSm3afqvUQf2QfiihlZKobdRBUaWKRkXggs1kM9jG2AZPmMGAGTwxG9z9O+8s93B5w73P97x7nv2WtHTt++49557132vca+/dd+LEidRwmpl5eeZlmednnpv5sswzMk/PfG7mSeVnj2X+OPPbmd/M/FrmfZn3ZN6WeUvmg01+2L4GArIw8xczryp5Tpevvz/zhpJ/mnnXOCCfpyWZv5b5KyUgo0kA+XHmH2XecSYDwtz8WgnE7Q0ZoI+XwPxTafbOCECuzvytzL+ReUJDTfkHmX+Q+a8z7zxdAVmc+U8yfzXzWWls0KeZ/yXzn2V+/nQBZEb5QHdnPieNTTqe+e8zf7eM3sYkIH2Zv575LzNPTacHHcr87cz3Zj4xlgCRK/xj5rXp9KR1mX+rzHG6SnXYclHT5tMYjFQ+2+byWRsLyPmZ78n8w8yT0+lPk8tnvad89kaZLKWM/8x8azozaWPmX8x8oAmAXJv5v2oocYw1UpL5UuZne2myVmR+aByMguaUsljRK0DWZP6fzNPGsThJ00qZrBltk6X2dH/6/7L3OH2Wjmb+udRfG6sdkOsyP5x5yrjch6TDme/MvLVOQGaVqM8el3db9HLmleVr133IeZn/YxyMjois/q2UXdcB+V5qzrzFWCIy+7tum6yvlVlpT+iTTz5Jn376afJbveKXXnopPfXUU2nTpk3phRdeSG+99Vbx2alTp6Ybbrgh3XHHHem6665Ll19+eTr33HObAMyvp/7JryGpnXL43FI7ekIffPBBOnbsWProo4/Sxx9/nD788MP07rvvphdffLEAYu/evenll18u/oZ8dsqUKWn69OnpoosuShdeeGG6+OKLmwAIGa5PwxQkhwNECf0fUg9qU7TgnXfeSa+//nrBhw8fLoA4evRoOnjwYHr11VcLLXnttddOghHf27NnT3r//feL9ydNmlQAdM45PZ+KIUMV8J9NQ5Tuh/uV38j8hdH6xUY3wXsFxptvvlkI/I033kiHDh0q3geI9/3/vffeKwBoJe/v2rWrAGLJkiVp3rx5xb/POqvnE5VrM38z9RckOwaEnv/FaP1SAjayd+7cWZgjWkH4QMBMFbOFBwMiKPwicAHrlaY0AJBUylS0+langJh2nV7nL2NSjhw5UggNCMB49tlni9ENkIGE3tfXl9rNnXzu+PHjxX0a1H+mvPLnmX+vE0A0JPxO3T7ilVdeKQAAxP79+wvTdODAgZMR00BgdAKKz4mwzjvvvHT22Wc3KRTWX/C3aYDGicEA+W6qqSEBECKnAGP9+vVp69atBRjC28/9wOyMCdUrDrMTpmug7xQJVv5cNdpqGCBk+6epvy9tWED0Td1VFxgc8r59+wowNm/enLZv315oRSsBQbg6Y8aM4nXatGlp8uTJaeLEiYUZ8p3nnnuuMHVVvxF0ySWXpKuuuipdeumlRejbQPpKabp2DAfIH6Sa+qaYoh07dhQJHebEOdxWjTCyCfLKK68s+IorrigSPEI22mkHM8cU+ffbb799EhRmaubMmWnp0qXp2muvLb7ncw0kMv5Wab4GBWRGqmHiHskhJHGPP/54AYZ/e69q7wkSAEb2nDlz0qxZswoNCS2hIUETJkwoAPCevAQwNJDwgXn11VenRYsWFSYrfE8Diaz/KFV6vVoB0d45sdt3laQxLc8880xR6ti9e3cRxgax75dddllavHhxuv7664uRTSuEqgSMWxM7IN1yyy0FcKI04PIngAICUIDVUO0IIuvfzPxXg9Wytqf+TvSu1qEA8OijjxYOfMuWLYUzDiK82bNnF2AsW7asSOTmz5+fLrjggo58E4Ddi+85//zz0xgiPmTpQBpyc7fBQMwJEB555JHCCVfB4A8AceONNxYFQUDwHxx3R8Y4R1SdfqdBtKSU/ZOtgHy523fibEVRTBVnLgkMATJHShrAWLFiRWHvAdQpibjcx7VpiuuKyMYYQF8eCJBf6eYdmBAZ98aNG9O2bdsKOx8kDF24cGEBBj9ASwhyJJm+8BfoggTg8D0cOrDHEChk/50qIAtSF1cu8UvCWb5DvkFo4as4cOErxw2MBQsWjBgM+YykMgIFPkSURlv8fe7cuYUJHAO0sMRgdwDy892OqlRpRVbmKiK8Zao4cSCIpuQKzMtIyy6A2LBhw8kJKqDTxChK8lcChWq43GCCwfcCkNXd0ozQDkAAJfwGEjkZwSIpPmMkE0dGvms/+eSTReTmlfCDlGD8X3mGCRP2MmHMZIPzkcDgJCCrulUakaCp1DInXqv5Bu0gHJrBbI0khAbGY489VoTQorYAA9juDQSawYTRSCbSewZBw83X6vAh1oFf2a2cw8gkNAKJkkaYK8kaBy4Tl8B1Gk2FZjBTzBXB0wDXkyi6t1lE9wWU8opB4ncBhvly34Zqig6VmQBZ3s3ioVHKiYuwTDqFKTOCAUJ4SiSdVF8JlKCVXR5++OEiaot8RqZ+++23F37JvQUR8h7+KzQFAJHp+9xI/NYo0Q1+5bJuhrqEIBnkPzj3iKyAoDzCb3SiHVXNeOihhwrNoAk0Drg33XRTWrlyZWGSDIgAm68x7x6aEpNVXkV4DdWUpQCZ362riW44ca+tGbn8ACCdhLgEaOJKLsNnGP1ABoY8Q9i8atWqwicBojowooxCU3xHJAYMmgIIVQE+rWE0HyDzupmZM1NGcJX0SgGD0Not9oUDpxHr1q0rsn3hM2GGZui9UnKpOmvBgpDa56qaUnX0gKZNNKWTmtloATKrW1eTA+BWQKI3iuDaaVoLzYg8g09geoxuyd7NN99cmKlrrrnmc/6AwJXtq8C6JxMKUL6NpsjiscKmPKUhM4qXA2RGN30IMDjXVkBoCdM1XH9UVTMefPDBwoFHLiOHUW5hpmjGYAkf4ZqYCh8BENcDMmBpit8SpRVlnIaUWYooa2q3rhZz363OEiDs9XANa8yLaCpCW2aKAJk50RQzpRApfB0uUnIfmhK/yXUAG/1dzz//fAEKzaUlDQFkimnErukqLSB4wop5bH5DuGvE+vtgvVE0QznkiSeeSA888EAx3x5Jn4AAGHfeeWehGXKOdsi9+BQOHKCEH/dXTRANRt2rIVQM14u6pm9Z+EaaEewhjUajNDLzwSaOmDqOl1mRaygYitSMYKN3+fLl6bbbbiuuW42m2iF+A7DRmxW9Xpy5gdOuGY35+pp9zaSutvoYgR6Qw2WXhZvsPA0ZKsQkMBrBZ8gZjF7gAYMDZ6bkGe1qRhUMpokJdN2YAmDGhM26470OFmkBQnRGiwQaBpvnoWV1TQ0D5Gi3tCQiF75CzapdiuRN80NUhl0DILSChnSaXUdEpe6FAeM9ppT5onHMoKhtoESV1ipUCjC80jCDSshNo7zWQMcA8kmvDSczQljVLhQPTVASyU7L58wdgCWUTKCk0LVd00BRaqF1Q2mHQcJ08mnR1grICDJqAuQ4QA6lHu/Wwzwxa/yNfMHDM3d8EN9ilNKWduy3kS2spRXAAIxruYc6FjBWr15dmNShkkJm00ykCoGEl//wewySGiOywwDREzS3l4DQAlmzSaann366MDUEIm/gW9h8+Y0RPZTtjllKQNAOmgEM3+eDaAUeDgwDgt9gqmhHEEBwdUqhy3QQIK/22mQFIEYhh0mIBCEMBgRmwwmWzR8odA7N0N3CzNAMDtlnTYZJJpVahgMjrgWQKI625lk1RloHALK314AQmgiNAxfNiG6i1RQw3gu/4m9seTWEFj2ZEKMZrWaKzxD1RWfLcGC4fiyRqAJisPiuoKBGk7UXIHuakhWJYkRUMQppBh9COCq9UeciHCM9svvwGVUzFSURyWSE4e0UEpV9JIwxFVwdNDRZ6N3p5FoHVDQ5PNcUQAjaAzNfBI/lEEroBMSfEAyBGMlRElFiYaY4YSASPNPGTLWrGVVzFfM5orXqbwtAatSQ7QDZ3LRJATkHTaEl7HZMUtEUQveeAAAw3jO3TkuiykwbRFKdaEY13KWVuNqg4Z7C76hG1ERbAGIvdFs/zG6apsikRTzMkvcIiaNXxjCKASKyUpAkPCNYRZhWcOCdaEaQ68R9qpNs7qUKwazWZLJg8HqUTqyfvqtpmuLhgRJL07T9MF9hTpismDZmymgDINoJbYcCQ7gtmIiiI031W2JJRE3N3OujdNJYQBBNYb6AEgVCQqvad4KXo0j6RqoZnHksPGUeq9qhjCMzV7F23Zp2hthQBeS/U4PJ6OTow5HTFKM4iDZw4HyGbHwk07KCBkkppoHVKgIzqGId7Us1La++rwrI7pIXNBUU5sJcCPNBS2I5m/eZKICMRDP4KNqgO1+0Jmyuhrv8kvkUOZK+gJp2hAj5f6b73WL2bzddUwgmEj4aI1FjroYqFA5FSiFRiFQRrnbpAz0muGLtSk2tQ/9+sqhaefPHTQckfIqZR3PrMWE0klJGFDBpBBOokULkVl1RJsTVaQlsmljjrkL/OhAgFoxYXrWk6aDEmvVTIcuz5S40w0xldDpWTRUtNEHGL9WYnTsOY9PJikDLH7+fxiBF/+5Q+5/E56JPi0Yorcvw1cyqURuNi9Vderz4jhrpMxvRtC76NEcqfJnYdAAIULbOBzA9NIYpY/MHml2MrnwJH82Q8fMZQtwqGHwSfyFiW7NmTVG2r3ERqaKb/X4HXRbtD3Y9++2mgmGEMzfCXhVeAo05eN0pIi2jm/0Pmw8w2TwQzALyG5Hdty7P9l1llyjV17yi90ep5TySgbb440O2pQaegkMz5AiEyuTEBmYxrWrWUVERKHIHdl99ixbxETSCdvhe6yRTJH+33nprUSGmGTVvycG+2qZ9+3CAIIdifbVpgNAEYNx///3FvId58pi8iiowZ0ywAUjM/NEqJo55GqizUluqfIYT58xHsu6xQ/rnNMDmM4MBsrjUksYcUWREG+VmBO+7776iwjsYEaYwldYA0Zx4THK1agW/A0BJp06UkS5C7ZCOl9rxuQPHBhO4fZycufS7TQGEWWJq+I3qyqzBPktz+ITB5r85fprANCmLMHOaLEZp56B70iCnvw2lAXGiWiOWG3HMEjdmp53Wz5jgquYuMnmjH/M1sn41MmCM4qqqQ5n/eNAca4gv2tbtO6Wm9JzkGTjWdrRLsfSAw9dKxDx55WNohBxjlJdN/2EaZL/F4QCJRJHjWdtrQGKXHyN5uFCUgydk5ser7yidC2mVQmiHa/Vgk5p1wyXfwwHC4zuNzDRvT1ffRwsooerbqpbIW8moN4fCQat9MVWct39LHP27B3SklOWJUwEE7Uv9O2j+sJeAEGrsjSUp9BpN0ExYrEmnEcBYu3Zt8Sra8v6pFCK7RL+f2jhmr5PjKqjaN3ptuiy51rOlAyUaH0RUzA/TJFtXf1KH4isaQg6i/GY7H+wEEAbXGUu39fLJYjsmWmIHIIVCCSIN4qT5h9hIoCHrBlVy7dLQVv9pJ+URF/zV1MHhJHVQmJ7Y+m8gHmhZXY+IrH65XTA61ZCg8SOP2qz0pBEceTSSAqIb2Ero2LjMBy8WlDLa2ukXR1rRfSz1H6I4DsrAYHyplFHnJvkUN6l3iKL2lanjOJwsi/zCSME4FQ2paopDFPePY1HIYM2pgNENQMKn0JSNZzAYnn3lSHxGHYAU+Vo5Ou49A8G4t3z2rqxE66vhoBP7mTsA63Q/U/1IWQ7pakmpr6aTZ+zB5TCxnzlNwfjfzF9PNaw+q6uRwQ91mNjdZeRxOkVRd5fPVstSwDo7S6ieqcpFqf+ky+NjGIjj5TMsKp+ptgOt+kbxsCx7bZgWvis1sMVoEDI1qefZAWk7R+OGfT04vQwwTpZxVsmEhgJhseIPMv9NajmS6HQEJGhmCYp5gqY0eBP+90swDvbiB/Q15Hy/W1L/IVm/lLp4KECbtCvzT0rTtKnXguhr0IGLQQD5Yurf/lz5utvTfq+k/ok2a/p+WgLSGGoiIK1kk3i7b+v0m1fypam/U18zld1oorvN/k76RC2D0sRs55i9JdsKYkvmN5r8sP8HkobyJWvdQqMAAAAASUVORK5CYII=",
        this.x + this.w - 15,
        this.y + this.h - 15,
        25,
        25
      )
      this.ctx.drawImage(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFzmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzYwLCAyMDIwLzAyLzEzLTAxOjA3OjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjEtMTEtMjRUMTg6MjQ6MTMrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjEtMTEtMjRUMTg6MjQ6MTMrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIxLTExLTI0VDE4OjI0OjEzKzA4OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmZmYmQzZjIyLTlhNWQtNDdkZS1hZDE2LTExYTI2Y2ZjN2JmNiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjdiNjQxMDBmLWM1NDgtYjM0ZC1hZGIw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",
        this.x + this.w - 15,
        this.y - 15,
        25,
        25
      )
    }
    this.ctx.restore()
  },
  /**
   * 给矩形描边
   * @private
   */
  _drawBorder() {
    let p = this.square
    let ctx = this.ctx
    this.ctx.save()
    this.ctx.beginPath()
    ctx.setStrokeStyle("orange")
    this._draw_line(this.ctx, p[0], p[1])
    this._draw_line(this.ctx, p[1], p[2])
    this._draw_line(this.ctx, p[2], p[3])
    this._draw_line(this.ctx, p[3], p[0])
    ctx.restore()
  },
  /**
   * 画一条线
   * @param ctx
   * @param a
   * @param b
   * @private
   */
  _draw_line(ctx, a, b) {
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.stroke()
  },
  /**
   * 判断点击的坐标落在哪个区域
   * @param {*} x 点击的坐标
   * @param {*} y 点击的坐标
   */
  isInGraph(x, y) {
    // 删除区域左上角的坐标和区域的高度宽度
    const size = 25

    // 旋转后的删除区域坐标
    const transformedDelCenter = this._rotatePoint(
      this.x,
      this.y,
      this.centerX,
      this.centerY,
      this.rotate
    )
    const transformDelX = transformedDelCenter[0] - size / 2
    const transformDelY = transformedDelCenter[1] - size / 2

    // 变换区域左上角的坐标和区域的高度宽度
    const transformedScaleCenter = this._rotatePoint(
      this.x + this.w,
      this.y + this.h,
      this.centerX,
      this.centerY,
      this.rotate
    )

    // 旋转后的变换区域坐标
    const transformScaleX = transformedScaleCenter[0] - size / 2
    const transformScaleY = transformedScaleCenter[1] - size / 2

    const overturnedScaleCenter = this._rotatePoint(
      this.x + this.w,
      this.y,
      this.centerX,
      this.centerY,
      this.rotate
    )
    const overturnScaleX = overturnedScaleCenter[0] - size / 2
    const overturnScaleY = overturnedScaleCenter[1] - size / 2

    // 调试使用，标识可操作区域
    if (DEBUG_MODE) {
      // 标识删除按钮区域
      this.ctx.setLineWidth(1)
      this.ctx.setStrokeStyle("red")
      this.ctx.strokeRect(transformDelX, transformDelY, size, size)
      // 标识旋转/缩放按钮区域
      this.ctx.setLineWidth(1)
      this.ctx.setStrokeStyle("black")
      this.ctx.strokeRect(transformScaleX, transformScaleY, size, size)
      // 标识移动区域
      this._drawBorder()
    }

    if (
      x - overturnScaleX >= 0 &&
      y - overturnScaleY >= 0 &&
      overturnScaleX + size - x >= 0 &&
      overturnScaleY + size - y >= 0
    ) {
      // 翻转区域
      return "overturn"
    }

    if (
      x - transformScaleX >= 0 &&
      y - transformScaleY >= 0 &&
      transformScaleX + size - x >= 0 &&
      transformScaleY + size - y >= 0
    ) {
      // 缩放区域
      return "transform"
    }

    if (
      x - transformDelX >= 0 &&
      y - transformDelY >= 0 &&
      transformDelX + size - x >= 0 &&
      transformDelY + size - y >= 0
    ) {
      // 删除区域
      return "del"
    }

    if (this.insidePolygon(this.square, [x, y])) {
      return "move"
    }

    // 不在选择区域里面
    return false
  },
  /**
   *  判断一个点是否在多边形内部
   *  @param points 多边形坐标集合
   *  @param testPoint 测试点坐标
   *  返回true为真，false为假
   *  */
  insidePolygon(points, testPoint) {
    let x = testPoint[0],
      y = testPoint[1]
    let inside = false
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      let xi = points[i][0],
        yi = points[i][1]
      let xj = points[j][0],
        yj = points[j][1]

      let intersect =
        yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }
    return inside
  },
  /**
   * 计算旋转后矩形四个顶点的坐标（相对于画布）
   * @private
   */
  _rotateSquare() {
    this.square = [
      this._rotatePoint(
        this.x,
        this.y,
        this.centerX,
        this.centerY,
        this.rotate
      ),
      this._rotatePoint(
        this.x + this.w,
        this.y,
        this.centerX,
        this.centerY,
        this.rotate
      ),
      this._rotatePoint(
        this.x + this.w,
        this.y + this.h,
        this.centerX,
        this.centerY,
        this.rotate
      ),
      this._rotatePoint(
        this.x,
        this.y + this.h,
        this.centerX,
        this.centerY,
        this.rotate
      ),
    ]
  },
  /**
   * 计算旋转后的新坐标（相对于画布）
   * @param x
   * @param y
   * @param centerX
   * @param centerY
   * @param degrees
   * @returns {*[]}
   * @private
   */
  _rotatePoint(x, y, centerX, centerY, degrees) {
    let newX =
      (x - centerX) * Math.cos((degrees * Math.PI) / 180) -
      (y - centerY) * Math.sin((degrees * Math.PI) / 180) +
      centerX
    let newY =
      (x - centerX) * Math.sin((degrees * Math.PI) / 180) +
      (y - centerY) * Math.cos((degrees * Math.PI) / 180) +
      centerY
    return [newX, newY]
  },
  /**
   *
   * @param {*} px 手指按下去的坐标
   * @param {*} py 手指按下去的坐标
   * @param {*} x 手指移动到的坐标
   * @param {*} y 手指移动到的坐标
   * @param {*} currentGraph 当前图层的信息
   */
  transform(px, py, x, y, currentGraph) {
    // 获取选择区域的宽度高度
    if (this.type === "text") {
      this.ctx.setFontSize(this.fontSize)
      const textWidth = this.ctx.measureText(this.text).width
      const textHeight = this.fontSize + 10
      this.w = textWidth
      this.h = textHeight
      // 字体区域中心点不变，左上角位移
      this.x = this.centerX - textWidth / 2
      this.y = this.centerY - textHeight / 2
    } else {
      this.centerX = this.x + this.w / 2
      this.centerY = this.y + this.h / 2
    }

    const diffXBefore = px - this.centerX
    const diffYBefore = py - this.centerY
    const diffXAfter = x - this.centerX
    const diffYAfter = y - this.centerY

    const angleBefore = (Math.atan2(diffYBefore, diffXBefore) / Math.PI) * 180
    const angleAfter = (Math.atan2(diffYAfter, diffXAfter) / Math.PI) * 180

    // 旋转的角度
    if (ROTATE_ENABLED) {
      this.rotate = currentGraph.rotate + angleAfter - angleBefore
    }

    const lineA = Math.sqrt(
      Math.pow(this.centerX - px, 2) + Math.pow(this.centerY - py, 2)
    )
    const lineB = Math.sqrt(
      Math.pow(this.centerX - x, 2) + Math.pow(this.centerY - y, 2)
    )
    if (this.type === "image") {
      let resize_rito = lineB / lineA
      let new_w = currentGraph.w * resize_rito
      let new_h = currentGraph.h * resize_rito

      if (currentGraph.w < currentGraph.h && new_w < this.MIN_WIDTH) {
        new_w = this.MIN_WIDTH
        new_h = (this.MIN_WIDTH * currentGraph.h) / currentGraph.w
      } else if (currentGraph.h < currentGraph.w && new_h < this.MIN_WIDTH) {
        new_h = this.MIN_WIDTH
        new_w = (this.MIN_WIDTH * currentGraph.w) / currentGraph.h
      }

      this.w = new_w
      this.h = new_h
      this.x = currentGraph.x - (new_w - currentGraph.w) / 2
      this.y = currentGraph.y - (new_h - currentGraph.h) / 2
    } else if (this.type === "text") {
      const fontSize = currentGraph.fontSize * ((lineB - lineA) / lineA + 1)
      this.fontSize =
        fontSize <= this.MIN_FONTSIZE ? this.MIN_FONTSIZE : fontSize

      // 旋转位移后重新计算坐标
      this.ctx.setFontSize(this.fontSize)
      const textWidth = this.ctx.measureText(this.text).width
      const textHeight = this.fontSize + 10
      this.w = textWidth
      this.h = textHeight
      // 字体区域中心点不变，左上角位移
      this.x = this.centerX - textWidth / 2
      this.y = this.centerY - textHeight / 2
    }
  },
  toPx(rpx) {
    return rpx * this.factor
  },
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    graph: {
      type: Object,
      value: {},
      observer: "onGraphChange",
    },
    bgColor: {
      type: String,
      value: "",
    },
    bgImage: {
      type: String,
      value: "",
    },
    bgSourceId: {
      type: String,
      value: "",
    },
    width: {
      type: Number,
      value: 750,
    },
    height: {
      type: Number,
      value: 750,
    },
    enableUndo: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    history: [],
  },

  attached() {
    const sysInfo = wx.getSystemInfoSync()
    const screenWidth = sysInfo.screenWidth
    this.factor = screenWidth / 750

    if (typeof this.drawArr === "undefined") {
      this.drawArr = []
    }
    this.ctx = wx.createCanvasContext("canvas-label", this)
    this.draw()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toPx(rpx) {
      return rpx * this.factor
    },
    initBg() {
      this.data.bgColor = ""
      this.data.bgSourceId = ""
      this.data.bgImage = ""
    },
    initHistory() {
      this.data.history = []
    },
    recordHistory() {
      if (!this.data.enableUndo) {
        return
      }
      this.exportJson()
        .then((imgArr) => {
          this.data.history.push(JSON.stringify(imgArr))
        })
        .catch((e) => {
          console.error(e)
        })
    },
    undo() {
      if (!this.data.enableUndo) {
        console.log(`后退功能未启用，请设置enableUndo="{{true}}"`)
        return
      }
      if (this.data.history.length > 1) {
        this.data.history.pop()
        let newConfigObj = this.data.history[this.data.history.length - 1]
        this.initByArr(JSON.parse(newConfigObj))
      } else {
        console.log("已是第一步，不能回退")
      }
    },
    onGraphChange(n) {
      if (JSON.stringify(n) === "{}") return
      this.drawArr.push(
        new dragGraph(
          Object.assign(
            {
              x: 30,
              y: 30,
            },
            n
          ),
          this.ctx,
          this.factor
        )
      )
      this.draw()
      // 参数有变化时记录历史
      this.recordHistory()
    },
    initByArr(newArr) {
      this.drawArr = [] // 重置绘画元素
      this.initBg() // 重置绘画背景
      // 循环插入 drawArr
      newArr.forEach((item, index) => {
        switch (item.type) {
          case "bgColor":
            this.data.bgImage = ""
            this.data.bgSourceId = ""
            this.data.bgColor = item.color
            break
          case "bgImage":
            this.data.bgColor = ""
            this.data.bgImage = item.url
            if (item.sourceId) {
              this.data.bgSourceId = item.sourceId
            }
            break
          case "image":
          case "text":
            if (index === newArr.length - 1) {
              item.selected = true
            } else {
              item.selected = false
            }
            this.drawArr.push(new dragGraph(item, this.ctx, this.factor))
            break
        }
      })
      this.draw()
    },
    draw() {
      if (this.data.bgImage !== "") {
        this.ctx.drawImage(
          this.data.bgImage,
          0,
          0,
          this.toPx(this.data.width),
          this.toPx(this.data.height)
        )
      }
      if (this.data.bgColor !== "") {
        this.ctx.save()
        this.ctx.setFillStyle(this.data.bgColor)
        this.ctx.fillRect(
          0,
          0,
          this.toPx(this.data.width),
          this.toPx(this.data.height)
        )
        this.ctx.restore()
      }
      this.drawArr.forEach((item) => {
        item.paint()
      })
      return new Promise((resolve) => {
        this.ctx.draw(false, () => {
          resolve()
        })
      })
    },
    start(e) {
      isMove = false // 重置移动标识
      const { x, y } = e.touches[0]
      this.tempGraphArr = []
      let lastDelIndex = null // 记录最后一个需要删除的索引
      this.drawArr &&
        this.drawArr.forEach((item, index) => {
          const action = item.isInGraph(x, y)
          if (action) {
            item.action = action
            this.tempGraphArr.push(item)
            // 保存点击时的坐标
            this.currentTouch = { x, y }
            if (action === "del") {
              lastDelIndex = index // 标记需要删除的元素
            }
            if (action === "overturn") {
              // var imgData = this.ctx.getImageData(this.x, this.y, this.w, this.h)
              // var newImgData = this.ctx.getImageData(this.x, this.y, this.w, this.h)
              // var newImgData = ctx.getImageData(0, 0, w, h);
              // this.ctx.putImageData(imageDataHRevert(newImgData, imgData), 0, 0)//左右翻转~~~~
            }
          } else {
            item.action = false
            item.selected = false
          }
        })
      // 保存点击时元素的信息
      if (this.tempGraphArr.length > 0) {
        for (let i = 0; i < this.tempGraphArr.length; i++) {
          let lastIndex = this.tempGraphArr.length - 1
          // 对最后一个元素做操作
          if (i === lastIndex) {
            // 未选中的元素，不执行删除和缩放操作
            if (lastDelIndex !== null && this.tempGraphArr[i].selected) {
              if (this.drawArr[lastDelIndex].action === "del") {
                this.drawArr.splice(lastDelIndex, 1)
                this.ctx.clearRect(
                  0,
                  0,
                  this.toPx(this.data.width),
                  this.toPx(this.data.height)
                )
              }
            } else {
              this.tempGraphArr[lastIndex].selected = true
              this.currentGraph = Object.assign(
                {},
                this.tempGraphArr[lastIndex]
              )
            }
          } else {
            // 不是最后一个元素，不需要选中，也不记录状态
            this.tempGraphArr[i].action = false
            this.tempGraphArr[i].selected = false
          }
        }
      }
      this.draw()
    },
    move(e) {
      const { x, y } = e.touches[0]
      if (this.tempGraphArr && this.tempGraphArr.length > 0) {
        isMove = true // 有选中元素，并且有移动时，设置移动标识
        const currentGraph = this.tempGraphArr[this.tempGraphArr.length - 1]
        if (currentGraph.action === "move") {
          currentGraph.centerX =
            this.currentGraph.centerX + (x - this.currentTouch.x)
          currentGraph.centerY =
            this.currentGraph.centerY + (y - this.currentTouch.y)
          // 使用中心点坐标计算位移，不使用 x,y 坐标，因为会受旋转影响。
          if (currentGraph.type !== "text") {
            currentGraph.x = currentGraph.centerX - this.currentGraph.w / 2
            currentGraph.y = currentGraph.centerY - this.currentGraph.h / 2
          }
        } else if (currentGraph.action === "transform") {
          currentGraph.transform(
            this.currentTouch.x,
            this.currentTouch.y,
            x,
            y,
            this.currentGraph
          )
        }
        // 更新4个坐标点（相对于画布的坐标系）
        currentGraph._rotateSquare()

        this.draw()
      }
    },
    end(e) {
      this.tempGraphArr = []
      if (isMove) {
        isMove = false // 重置移动标识
        // 用户操作结束时记录历史
        this.recordHistory()
      }
    },
    export() {
      return new Promise((resolve, reject) => {
        this.drawArr = this.drawArr.map((item) => {
          item.selected = false
          return item
        })
        this.draw().then(() => {
          wx.canvasToTempFilePath(
            {
              canvasId: "canvas-label",
              success: (res) => {
                resolve(res.tempFilePath)
              },
              fail: (e) => {
                reject(e)
              },
            },
            this
          )
        })
      })
    },
    exportJson() {
      return new Promise((resolve, reject) => {
        let exportArr = this.drawArr.map((item) => {
          item.selected = false
          switch (item.type) {
            case "image":
              return {
                type: "image",
                url: item.fileUrl,
                y: item.y,
                x: item.x,
                w: item.w,
                h: item.h,
                rotate: item.rotate,
                sourceId: item.sourceId,
              }
              break
            case "text":
              return {
                type: "text",
                text: item.text,
                color: item.color,
                fontSize: item.fontSize,
                y: item.y,
                x: item.x,
                w: item.w,
                h: item.h,
                rotate: item.rotate,
              }
              break
          }
        })
        if (this.data.bgImage) {
          let tmp_img_config = {
            type: "bgImage",
            url: this.data.bgImage,
          }
          if (this.data.bgSourceId) {
            tmp_img_config["sourceId"] = this.data.bgSourceId
          }
          exportArr.unshift(tmp_img_config)
        } else if (this.data.bgColor) {
          exportArr.unshift({
            type: "bgColor",
            color: this.data.bgColor,
          })
        }

        resolve(exportArr)
      })
    },
    changColor(color) {
      const selected = this.drawArr.filter((item) => item.selected)
      if (selected.length > 0) {
        selected[0].color = color
      }
      this.draw()
      // 改变文字颜色时记录历史
      this.recordHistory()
    },
    changeBgColor(color) {
      this.data.bgImage = ""
      this.data.bgColor = color
      this.draw()
      // 改变背景颜色时记录历史
      this.recordHistory()
    },
    changeBgImage(newBgImg) {
      this.data.bgColor = ""
      if (typeof newBgImg == "string") {
        this.data.bgSourceId = ""
        this.data.bgImage = newBgImg
      } else {
        this.data.bgSourceId = newBgImg.sourceId
        this.data.bgImage = newBgImg.url
      }
      this.draw()
      // 改变背景图片时记录历史
      this.recordHistory()
    },
    clearCanvas() {
      this.ctx.clearRect(
        0,
        0,
        this.toPx(this.data.width),
        this.toPx(this.data.height)
      )
      this.ctx.draw()
      this.drawArr = []
      this.initBg() // 重置绘画背景
      this.initHistory() // 清空历史记录
    },
  },
})
