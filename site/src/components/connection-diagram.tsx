export function ConnectionDiagram() {
  return (
    <figure
      className="connection-diagram"
      aria-label="Your Java Edition client connects through StackAnvil to a Bedrock server"
    >
      <div className="diagram-caption">
        <span className="status-dot" />
        Java to Bedrock
      </div>
      <svg viewBox="0 0 540 260" role="img" aria-labelledby="connection-title">
        <title id="connection-title">Java client to StackAnvil to Bedrock server</title>
        <g
          className="diagram-lines"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path
            d="M100 145L270 235L440 145M100 100L270 190L440 100"
            strokeDasharray="3 6"
            opacity=".25"
          />
          <path d="M145 140L230 185M310 185L395 140" />
          <path d="M77 66L122 42L167 66L122 91ZM77 66V124L122 150L167 124V66M122 91V150" />
          <path d="M373 66L418 42L463 66L418 91ZM373 66V124L418 150L463 124V66M418 91V150" />
          <path d="M373 84L418 109L463 84M373 104L418 129L463 104" opacity=".5" />
          <path d="M225 143L270 119L315 143L270 168ZM225 143V183L270 208L315 183V143M270 168V208" />
        </g>
        <g fill="currentColor" className="diagram-dots">
          <circle cx="190" cy="164" r="3" />
          <circle cx="350" cy="164" r="3" />
          <circle cx="270" cy="143" r="4" />
        </g>
        <g fill="currentColor" className="diagram-text">
          <text x="122" y="181" textAnchor="middle">
            Java Edition
          </text>
          <text x="418" y="181" textAnchor="middle">
            Bedrock server
          </text>
          <text x="270" y="245" textAnchor="middle">
            StackAnvil
          </text>
        </g>
      </svg>
      <figcaption>Your client stays Java. Your destination is Bedrock.</figcaption>
    </figure>
  );
}
