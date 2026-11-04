<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Billets d'entrée</title>
    <style>
        @page {
            margin: 5mm;
        }
        body {
            font-family: "Courier New", Courier, monospace;
            margin: 0;
            padding: 0;
        }
        .slip-container {
            /* Removing width: 100% and box-sizing to prevent DOMPDF overflow */
            display: block;
            height: 75mm; /* 75mm + 10mm padding = 85mm total, fits safely inside 95mm */
            border: 1px solid #000;
            padding: 5mm;
            position: relative;
        }
        .header {
            display: block;
            margin-bottom: 5mm;
            position: relative;
        }
        .school-name {
            font-size: 14px;
            text-decoration: underline;
            float: left;
        }
        .date {
            font-size: 14px;
            float: right;
        }
        .date-line {
            display: inline-block;
            border-bottom: 1px dotted #000;
            width: 80px;
            text-align: center;
        }
        .title-container {
            clear: both;
            text-align: center;
            margin-top: 10px;
            margin-bottom: 15px;
        }
        .title {
            display: inline-block;
            font-size: 16px;
            font-weight: bold;
            border: 1px solid #000;
            padding: 2px 10px;
        }
        .body-text {
            font-size: 14px;
            margin-bottom: 15px;
        }
        .students-grid {
            display: block;
            margin-bottom: 15px;
        }
        .student-row {
            margin-bottom: 8px;
            clear: both;
        }
        .student-col {
            width: 48%;
            float: left;
            font-size: 13px; /* Slightly smaller to accommodate long names */
            white-space: nowrap; /* Prevent names from wrapping to a second line */
            overflow: hidden;
        }
        .student-col:last-child {
            float: right;
        }
        .dotted-line {
            display: inline-block;
            border-bottom: 1px dotted #000;
            margin-left: 5px;
            width: 140px;
            white-space: nowrap;
        }
        .motif-row {
            font-size: 14px;
            margin-bottom: 25px;
            clear: both;
        }
        .motif-line {
            display: inline-block;
            border-bottom: 1px dotted #000;
            margin-left: 5px;
            width: 80%;
        }
        .signature-row {
            font-size: 14px;
            margin-bottom: 10px;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    @foreach ($billets as $index => $item)
        @php
            $billet = $item['billet'];
            $students = $item['students']->values(); // 0-indexed collection
        @endphp
        <div class="slip-container">
            <div class="header clearfix">
                <div class="school-name">ISTA Nador</div>
                <div class="date">
                    Le : <span class="date-line">{{ \Carbon\Carbon::parse($billet->date)->format('d/m/Y') }}</span>
                </div>
            </div>
            
            <div class="title-container">
                <div class="title">Billet d'entrée</div>
            </div>

            <div class="body-text">
                Prière de bien vouloir accepter le (s) stagiaire (s) :
            </div>

            <div class="students-grid clearfix">
                <div class="student-row clearfix">
                    <div class="student-col">
                        1 - <span class="dotted-line">{{ $students->has(0) ? $students[0]->full_name : '' }}</span>
                    </div>
                    <div class="student-col">
                        2 - <span class="dotted-line">{{ $students->has(1) ? $students[1]->full_name : '' }}</span>
                    </div>
                </div>
                <div class="student-row clearfix">
                    <div class="student-col">
                        3 - <span class="dotted-line">{{ $students->has(2) ? $students[2]->full_name : '' }}</span>
                    </div>
                    <div class="student-col">
                        4 - <span class="dotted-line">{{ $students->has(3) ? $students[3]->full_name : '' }}</span>
                    </div>
                </div>
            </div>

            <div class="motif-row">
                Motif : <span class="motif-line">{{ $billet->motif }}</span>
            </div>

            <div class="signature-row">
                Visa du Responsable :
            </div>
        </div>
        
        @if (!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>
</html>
