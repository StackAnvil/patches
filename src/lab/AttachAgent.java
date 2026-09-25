// SPDX-License-Identifier: GPL-3.0-or-later
import com.sun.tools.attach.VirtualMachine;

public final class AttachAgent {
    public static void main(final String[] args) throws Exception {
        if (args.length != 2) throw new IllegalArgumentException("Supply a PID and Java agent JAR");
        final VirtualMachine vm = VirtualMachine.attach(args[0]);
        try {
            vm.loadAgent(args[1]);
        } finally {
            vm.detach();
        }
    }
}
