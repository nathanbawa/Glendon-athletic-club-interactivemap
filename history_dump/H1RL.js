createLegend() {
  const uniqueRooms = {};
  ROOMS.forEach(room => {
    if (!uniqueRooms[room.id]) uniqueRooms[room.id] = room;
  });

  const roomsByCategory = {};
  Object.values(uniqueRooms).forEach(room => {
    if (!roomsByCategory[room.category]) roomsByCategory[room.category] = [];
    roomsByCategory[room.category].push(room);
  });

  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'legend-items';

  Object.keys(roomsByCategory).forEach(category => {
    const heading = document.createElement('button');
    heading.type = 'button';
    heading.className = 'legend-category-toggle';
    const eye = document.createElement('span');
    eye.className = 'toggle-eye';
    eye.setAttribute('aria-hidden', 'true');
    heading.appendChild(eye);
    heading.appendChild(document.createTextNode(category));
    heading.setAttribute('data-category', category);
    heading.setAttribute('aria-pressed', 'true');
    heading.setAttribute('title', 'Toggle visibility');
    heading.setAttribute('aria-label', `Toggle visibility: ${category}`);
    itemsContainer.appendChild(heading);

    roomsByCategory[category].forEach(room => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.setAttribute('data-category', category);
      item.setAttribute('data-room-id', room.id);

      const number = document.createElement('span');
      number.className = 'legend-number';
      number.textContent = room.number;
      number.style.backgroundColor = room.numberColor;

      const color = document.createElement('div');
      color.className = 'legend-item-color';
      color.style.backgroundColor = room.color;

      const icon = document.createElement('span');
      icon.className = 'legend-item-icon';
      icon.textContent = room.icon;

      const text = document.createElement('span');
      text.textContent = room.name;

      item.appendChild(color);
      item.appendChild(icon);
      item.appendChild(text);

      if (window.innerWidth <= 768) {
        item.style.width = '50%';
      }

      itemsContainer.appendChild(item);
    });
  });

  this.legendContainer.appendChild(itemsContainer);
}