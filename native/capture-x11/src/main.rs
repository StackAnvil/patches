// SPDX-License-Identifier: GPL-3.0-or-later
mod command;
mod x11;

type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;

fn main() -> std::process::ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
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
    match x11::run(command) {
        Ok(()) => std::process::ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error}");
            let code = error
                .downcast_ref::<x11::Interrupted>()
                .map_or(1, |error| 128 + error.0 as u8);
            std::process::ExitCode::from(code)
        }
    }
}
