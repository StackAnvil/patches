// SPDX-License-Identifier: GPL-3.0-or-later
mod command;
mod wayland;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

#[derive(Debug)]
struct ContextError {
    message: String,
    source: Box<dyn std::error::Error>,
}

impl ContextError {
    fn new(message: impl Into<String>, source: impl Into<Box<dyn std::error::Error>>) -> Self {
        Self {
            message: message.into(),
            source: source.into(),
        }
    }
}

impl std::fmt::Display for ContextError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "{}: {}", self.message, self.source)
    }
}

impl std::error::Error for ContextError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        Some(self.source.as_ref())
    }
}

fn main() -> std::process::ExitCode {
    // std::env::args panics on an argument that is not valid UTF-8, such as a file name.
    let Ok(args) = std::env::args_os()
        .skip(1)
        .map(std::ffi::OsString::into_string)
        .collect::<std::result::Result<Vec<String>, _>>()
    else {
        eprintln!("Arguments must be valid UTF-8\n{}", command::USAGE);
        return std::process::ExitCode::from(2);
    };
    if matches!(args.as_slice(), [arg] if arg == "--help" || arg == "help") {
        println!("{}", command::USAGE);
        return std::process::ExitCode::SUCCESS;
    }
    let command = match command::Command::parse(&args) {
        Ok(command) => command,
        Err(error) => {
            eprintln!("{error}\n{}", command::USAGE);
            return std::process::ExitCode::from(2);
        }
    };
    match wayland::run(command) {
        Ok(()) => std::process::ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error}");
            let code = error
                .downcast_ref::<wayland::Interrupted>()
                .map_or(1, wayland::Interrupted::exit_code);
            std::process::ExitCode::from(code)
        }
    }
}
