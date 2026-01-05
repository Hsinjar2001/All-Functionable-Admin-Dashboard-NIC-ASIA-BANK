import React from 'react';
import './SettingsSection.css';

const SettingsSection = () => {
  return (
    <section className="settings-section">
      <h2>Settings</h2>
      {/* Add settings forms or toggles here */}
      <form>
        <label>
          Notification:
          <input type="checkbox" defaultChecked />
        </label>
        <br />
        <label>
          Dark Mode:
          <input type="checkbox" />
        </label>
      </form>
    </section>
  );
};

export default SettingsSection;