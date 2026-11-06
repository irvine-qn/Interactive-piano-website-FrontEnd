const PublishedSheetActions = ({ sheet }) => (
  <div>
    <button type="button" aria-label={`Edit ${sheet.title}`} />
    <button type="button" aria-label={`View ${sheet.title}`} />
    <button type="button" aria-label={`Download ${sheet.title}`} />
    <p>{sheet.likes} saves</p>
  </div>
);

const DraftSheetActions = ({ sheet }) => (
  <div>
    <button type="button" aria-label={`Edit draft ${sheet.title}`} />
    <button type="button">Publish now</button>
  </div>
);

const ProfileSheetItem = ({ sheet }) => (
  <li>
    <div aria-hidden="true" />
    <div>
      <h3>{sheet.title}</h3>
      <p>{sheet.composer}</p>
      {sheet.isDraft ? (
        <p>Draft</p>
      ) : (
        <>
          <p>{sheet.bpm} BPM</p>
          <p>{sheet.keySignature}</p>
          <p>{sheet.views} plays</p>
        </>
      )}
    </div>
    {sheet.isDraft ? (
      <DraftSheetActions sheet={sheet} />
    ) : (
      <PublishedSheetActions sheet={sheet} />
    )}
  </li>
);

const ProfileSheetList = ({ sheets = [], total = sheets.length }) => (
  <section aria-label="Uploaded sheets">
    <header>
      <h2>All sheets ({total})</h2>
      <p>Newest first</p>
      <p>Difficulty, plays, MIDI format</p>
    </header>
    {sheets.length === 0 ? (
      <p>No sheets yet.</p>
    ) : (
      <>
        <ul>
          {sheets.map((sheet) => (
            <ProfileSheetItem key={sheet.id} sheet={sheet} />
          ))}
        </ul>
        <footer>
          <p>
            Showing {sheets.length} of {total} sheets
          </p>
          {sheets.length < total && <button type="button">Load more sheets</button>}
        </footer>
      </>
    )}
  </section>
);

export default ProfileSheetList;
