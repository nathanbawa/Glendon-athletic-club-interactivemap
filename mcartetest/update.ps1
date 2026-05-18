$path = "c:\Users\natha\Downloads\mcartetest\index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. Add data-floor="1" to existing Hotspots
$content = $content -replace '<button class="Hotspot"', '<button class="Hotspot" data-floor="1"'

# 2. Add Floor 2 Hotspots
$floor2Hotspots = @"
    <button class="Hotspot" data-floor="2" slot="hotspot-21" data-position="8.05645554772829m 0.22647450137212896m -14.131995909196124m" data-normal="3.2584136988587597e-7m 0.999999999999947m 0m" data-visibility-attribute="visible">
      <div class="hotspot-marker">
        <div class="hotspot-number color-basketball">17</div>
        <div class="hotspot-icon">🏀</div>
        <div class="hotspot-label">Gymnasium</div>
      </div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-22" data-position="-0.6775665667768678m 1.2322025299072428m 3.730655208481526m" data-normal="0m 1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">lobbystairsentrancepath</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-23" data-position="-9.204654805061875m 1.2322025299072266m 3.694690623344397m" data-normal="0m 1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">lobbystairsentrancepath</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-24" data-position="-10.086069333113533m 1.2322025299072428m -0.9708355911414226m" data-normal="0m 1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">lobbystairsentrancepath</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-25" data-position="-0.30369840837627393m 0.22647722545614646m -4.239748172413902m" data-normal="3.2584136988587597e-7m 0.999999999999947m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">lobbystairsentrancepath</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-26" data-position="-0.22591433895238922m 0.22647720011087874m -11.15685690617468m" data-normal="3.2584136988587597e-7m 0.999999999999947m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">gymnasiumpath</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-27" data-position="2.917252228670719m 0.22647617593717856m -13.952444424253732m" data-normal="3.2584136988587597e-7m 0.999999999999947m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">gymnasiumpath</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-28" data-position="-4.991251162552078m 2.232114475567305m -10.850693907424784m" data-normal="0m 1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">mainstairs</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-30" data-position="-3.272133863967484m 2.232114475567305m -6.21679161697859m" data-normal="0m 1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">gymnasiumentrance/exit</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-31" data-position="-3.287148723559886m 2.232114475567305m -15.274240051339927m" data-normal="0m 1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">gymnasiumentrance/exit</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-32" data-position="-7.05469747779607m 1.569336389089784m -15.345684348745433m" data-normal="1m 0m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">dancestudioentrance/exitM.lockerroom</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-33" data-position="-6.977047733999851m 0.23220258951185263m -6.347115051950414m" data-normal="0m 1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">dancestudioentrance/exitW.lockerroom</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-34" data-position="-12.209288723652179m 0.23220258951187134m -15.045506679926204m" data-normal="0m -1m 0m" data-visibility-attribute="visible">
      <div class="hotspot-marker">
        <div class="hotspot-number color-dance">18</div>
        <div class="hotspot-icon">💃</div>
        <div class="hotspot-label">Dance Studio</div>
      </div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-35" data-position="-9.244481180488398m 0.23220258951187134m -15.20557675484057m" data-normal="0m -1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">dancestudio/path</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-36" data-position="-9.86151759286875m 0.23220258951188877m -6.643402338350665m" data-normal="0m -1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">dancestudio/path</div>
    </button><button class="Hotspot" data-floor="2" slot="hotspot-37" data-position="-11.74789526324627m 0.23220258951187134m -9.244990541006334m" data-normal="0m -1m 0m" data-visibility-attribute="visible">
        <div class="HotspotAnnotation" style="display:none;">dancestudio/path</div>
    </button>
    <div class="progress-bar hide" slot="progress-bar">
"@

$content = $content.Replace('<div class="progress-bar hide" slot="progress-bar">', "$floor2Hotspots")

# 3. Add Floor Selector UI before </body>
$floorSelector = @"
  <!-- Floor Transition Overlay -->
  <div id="floor-transition-overlay"></div>

  <!-- Floor Selector UI -->
  <div id="floor-selector">
    <button class="floor-btn floor-active" id="floor-btn-1">
      <div class="floor-btn-front">Floor 1</div>
    </button>
    <div class="floor-btn-divider"></div>
    <button class="floor-btn" id="floor-btn-2">
      <div class="floor-btn-front">Floor 2</div>
    </button>
  </div>
</body>
"@

$content = $content.Replace('</body>', $floorSelector)

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
